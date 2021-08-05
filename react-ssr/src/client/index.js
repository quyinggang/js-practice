import React from 'react';
import ReactDOM from 'react-dom';
import { ClientRootApp } from '../tools/render';

ReactDOM.hydrate(<ClientRootApp />, document.getElementById('root'));
