const gulp = require('gulp');
const spawn = require('child_process').spawn;
const fs = require('fs').promises;
const readline = require('readline');

/**
 * Gulp task to run `tsc --watch` and `polymer serve` in parallel.
 */
gulp.task('serve', () => {
  const spawnOptions = {
    // `shell` option for Windows compatability. See:
    // https://nodejs.org/api/child_process.html#child_process_spawning_bat_and_cmd_files_on_windows
    shell: true,
    stdio: 'inherit'
  };
  spawn('tsc', ['--watch'], spawnOptions);
  spawn('polymer', ['serve', '-p', '8080', '-H', '0.0.0.0'], spawnOptions);
});

gulp.task('rename', async () => {
    const ui = readline.createInterface(process.stdin, process.stdout);
    const ask = msg => new Promise(resolve => ui.question(msg + ' ', resolve));
    const dash2Pascal = str => str.replace(/(?:^|-)(\w)/g, (x, y) => y.toUpperCase());
    const paths = [
        './index.html',
        './package.json',
        './polymer.json',
        './src/pho3nix-element.ts'
    ];
    
    const oldName = 'pho3nix-element';
    const oldNameRegex = new RegExp(oldName, 'gi');
    const newName = await ask('What will be your element\'s tagName?');
    const oldClassName = dash2Pascal(oldName);
    const newClassName = dash2Pascal(newName);

    const contents = await Promise.all(
        paths.map(path => fs.readFile(path).catch(e => console.warn(`Cannot read ${path} ${e.message}`)))
    );
    const newContent = contents.map(buffer => buffer && buffer.toString().replace(oldNameRegex, newName));
    newContent[3] = newContent[3].replace(oldClassName, newClassName);

    await Promise.all(paths.map((path, i) =>  newContent[i] && fs.writeFile(path, newContent[i]).catch(e => console.warn(`Cannot write ${path} ${e.message}`))));
    await fs.rename(paths[3], paths[3].replace(oldNameRegex, newName));

    ui.close();
    return Promise.resolve('Rename done');
})