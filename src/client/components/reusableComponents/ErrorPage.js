import React from 'react';

export class ErrorPage extends React.PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div
                style={{
                    margin: 'auto',
                    textAlign: 'center'
                }}
            >
                <i
                    style={{ fontSize: '20vh', color: 'gray' }}
                    className='fa fa-exclamation-triangle'
                    aria-hidden='true'
                />
                <div
                    style={{
                        paddingTop: '50px',
                        fontSize: '3vh',
                        color: 'gray',
                        textAlign: 'center'
                    }}
                >
                Oops Something went wrong...!!
                </div>
            </div>
        );
    }
}
