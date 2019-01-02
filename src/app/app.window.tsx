import * as React from 'react';
import { Window, Text, Box, WindowProps } from 'proton-native';

export class AppWindow extends React.Component<WindowProps> {

    readonly state = {
        currentTime: new Date().toString(),
    };

    render() {
        return <Window onClose={() => console.log('Closing')}>
            <Box padded={true}>
                <Text stretchy={true}>{this.state.currentTime}</Text>
                <Text stretchy={true}>{'Hello'}</Text>
            </Box>
        </Window>;
    }

    componentWillUnmount() {
        console.log('AppWindow componentWillUnmount');
    }

    componentDidMount() {
        console.log('AppWindow componentDidMount');
    }
}
