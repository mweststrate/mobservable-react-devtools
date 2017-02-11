const deduplicateDependencies = (depTree) => {
  if (!depTree.dependencies) return;

  for (let i = depTree.dependencies.length - 1; i >= 0; i -= 1) {
    const name = depTree.dependencies[i].name;
    for (let i2 = i - 1; i2 >= 0; i2 -= 1) {
      if (depTree.dependencies[i2].name === name) {
        depTree.dependencies[i2].dependencies = [].concat(
          depTree.dependencies[i2].dependencies || [],
          depTree.dependencies[i].dependencies || []
        );
        depTree.dependencies.splice(i, 1);
        break;
      }
    }
  }
  depTree.dependencies.forEach(deduplicateDependencies);
};

export default deduplicateDependencies;
