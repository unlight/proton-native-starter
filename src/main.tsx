import * as React from 'react';
import { App, render } from 'proton-native';
import { AppWindow } from './app/app.window';
import { AppMenu } from './app/app.menu';

export class Main extends React.Component {

    render() {
        console.log('Main render');
        return <App onShouldQuit={() => console.log('Quitting')}>
            <AppMenu></AppMenu>
            <AppWindow></AppWindow>
        </App>;
    }

    componentWillUnmount() {
        console.log('Main componentWillUnmount');
    }
}

render(<Main />);
