import * as React from 'react';
import { App, render } from 'proton-native';

function main() {
    console.log('main process.pid --- ', process.pid);
    const { AppMenu } = require('./app/app.menu');
    const { AppWindow } = require('./app/app.window');
    render(<App onShouldQuit={() => console.log('Quitting')}>
        <AppMenu></AppMenu>
        <AppWindow></AppWindow>
    </App>);
}

main();

// Hot Module Replacement API
if (module.hot) {
    module.hot.accept('./app/app.menu', main);
    module.hot.accept('./app/app.window', main);
}
