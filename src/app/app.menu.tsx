import * as React from 'react';
import { Window, Text, Box, Menu } from 'proton-native';

export class AppMenu extends React.Component {

    render() {
        return <Menu label="File">
            <Menu.Item type="Item" onClick={() => console.log()}>
                Open
          </Menu.Item>
            <Menu.Item type="Item" onClick={() => console.log()}>
                Save
          </Menu.Item>
            <Menu.Item type="Quit" />
        </Menu>
    }

    componentWillUnmount() {
        console.log('AppMenu componentWillUnmount');
    }

    componentDidMount() {
        console.log('AppMenu componentDidMount');
    }
}
