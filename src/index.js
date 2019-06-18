const path = require('path');
const findRoot = require('find-root');
const chalk = require('chalk');
const groupBy = require('lodash.groupby');
const semver = require('semver/semver');

const defaults = {
  verbose: false,
  showHelp: true,
  emitError: false,
  exclude: null,
  strict: true,
};

function DuplicatePackageCheckerPlugin(options) {
  this.options = Object.assign({}, defaults, options);
}

function cleanPath(pathString) {
  return pathString.split(/[/\\]node_modules[/\\]/).join('/~/');
}

// Get closest package definition from path
function getClosestPackage(modulePath) {
  let root;
  let pkg;

  // Catch findRoot or require errors
  try {
    root = findRoot(modulePath);
    pkg = require(path.join(root, 'package.json')); // eslint-disable-line import/no-dynamic-require, global-require
  } catch (e) {
    return null;
  }

  // If the package.json does not have a name property, try again from
  // one level higher.
  // https://github.com/jsdnxx/find-root/issues/2
  // https://github.com/date-fns/date-fns/issues/264#issuecomment-265128399
  if (!pkg.name) {
    return getClosestPackage(path.resolve(root, '..'));
  }

  return {
    package: pkg,
    path: root,
  };
}

DuplicatePackageCheckerPlugin.prototype.apply = function apply(compiler) {
  const {
    verbose, showHelp, emitError, exclude, strict, alwaysEmitErrorsFor = [],
  } = this.options;

  compiler.hooks.emit.tapAsync('DuplicatePackageCheckerPlugin', (
    compilation,
    callback,
  ) => {
    const { context } = compilation.compiler;
    const modules = {};

    function cleanPathRelativeToContext(modulePath) {
      let cleanedPath = cleanPath(modulePath);

      // Make relative to compilation context
      if (cleanedPath.indexOf(context) === 0) {
        cleanedPath = `.${cleanedPath.replace(context, '')}`;
      }

      return cleanedPath;
    }

    compilation.modules.forEach((module) => {
      if (!module.resource) {
        return;
      }

      const closestPackage = getClosestPackage(module.resource);

      // Skip module if no closest package is found
      if (!closestPackage) {
        return;
      }

      const pkg = closestPackage.package;
      const packagePath = closestPackage.path;

      const modulePath = cleanPathRelativeToContext(packagePath);

      const { version } = pkg;

      modules[pkg.name] = modules[pkg.name] || [];

      const isSeen = modules[pkg.name].find(pkgModule => pkgModule.version === version);

      if (!isSeen) {
        const entry = { version, path: modulePath };

        const issuer = module.issuer && module.issuer.resource
          ? cleanPathRelativeToContext(module.issuer.resource)
          : null;
        entry.issuer = issuer;

        modules[pkg.name].push(entry);
      }
    });

    const duplicates = {};

    Object.keys(modules).forEach((name) => {
      const instances = modules[name];

      if (instances.length <= 1) {
        return;
      }

      let filtered = instances;
      if (!strict) {
        filtered = [];
        const groups = groupBy(instances, instance => semver.major(instance.version)) || {};

        Object.keys(groups).forEach((groupKey) => {
          const group = groups[groupKey];
          if (group && group.length > 1) {
            filtered = filtered.concat(group);
          }
        });

        if (filtered.length <= 1) {
          return;
        }
      }

      if (exclude) {
        filtered = filtered.filter(instance => !exclude(Object.assign({ name }, instance)));

        if (filtered.length <= 1) {
          return;
        }
      }

      duplicates[name] = filtered;
    });

    const duplicateCount = Object.keys(duplicates).length;

    if (duplicateCount) {
      const sortedDuplicateKeys = Object.keys(duplicates).sort();

      sortedDuplicateKeys.forEach((name, index) => {
        const array = emitError || alwaysEmitErrorsFor.indexOf(name) >= 0
          ? compilation.errors
          : compilation.warnings;

        let instances = duplicates[name].sort((a, b) => (a.version < b.version ? -1 : 1));

        let error = `${name}\n${chalk.reset('  Multiple versions of ')}${chalk.green.bold(name)}${chalk.white(' found:\n')}`;

        instances = instances.map((version) => {
          let str = `${chalk.green.bold(version.version)} ${chalk.white.bold(
            version.path,
          )}`;
          if (verbose && version.issuer) {
            str += ` from ${chalk.white.bold(version.issuer)}`;
          }
          return str;
        });
        error += `    ${instances.join('\n    ')}\n`;
        // only on last warning
        if (showHelp && index === duplicateCount - 1) {
          error += `\n${chalk.white.bold(
            'Check how you can resolve duplicate packages: ',
          )}\nhttps://github.com/cerner/duplicate-package-checker-webpack-plugin#resolving-duplicate-packages-in-your-bundle\n`;
        }

        array.push(new Error(error));
      });
    }

    callback();
  });
};

module.exports = DuplicatePackageCheckerPlugin;
