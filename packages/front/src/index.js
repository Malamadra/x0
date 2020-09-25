import React from 'react'
import ReactDOM from 'react-dom'
import { createGlobalStyle } from 'styled-components'
import App from 'App'

const GlobalStyle = createGlobalStyle`  
  html {
    font-size: 100%;
  }
  
  body {
    a {
      text-decoration: none;
    }
  }
  
  body, html {
    height: 100%;
    margin: 0;
    padding: 0;
  }  
  
  #root {
    min-height: 100%;
  }
`

const Root = (
  <>
    <GlobalStyle />
    <App />
  </>
)

ReactDOM.render(Root, document.getElementById('root'))
