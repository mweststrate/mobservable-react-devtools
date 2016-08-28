const deduplicateDependencies = depTree => {
  if (!depTree.dependencies)
    return undefined;

  for (var i = depTree.dependencies.length - 1; i >= 0; i--) {
    var name = depTree.dependencies[i].name;
    for (var i2 = i - 1; i2 >= 0; i2--) {
      if (depTree.dependencies[i2].name === name) {
        depTree.dependencies[i2].dependencies = [].concat(depTree.dependencies[i2].dependencies || [], depTree.dependencies[i].dependencies || []);
        depTree.dependencies.splice(i, 1);
        break;
      }
    }
  }
  depTree.dependencies.forEach(deduplicateDependencies);
};

export default deduplicateDependencies;