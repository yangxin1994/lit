// Do not modify this file by hand!
// Re-generate this file by running lit-localize

import {html} from 'lit-html';

/* eslint-disable no-irregular-whitespace */
/* eslint-disable @typescript-eslint/no-explicit-any */

export const templates = {
  comment: html`Hola <b><!-- comment -->Mundo!</b>`,
  lit: html`Hola <b><i>Galaxia!</i></b>`,
  lit_variables_1: (url: any, name: any) =>
    html`Hola ${name}, clic <a href="${url}">aquí</a>!`,
  string: `Hola Mundo!`,
  variables_1: (name: any) => `Hola ${name}!`,
  lit_variables_2: (x: any) => html`${x}y${x}y${x}`,
  lit_variables_3: (x: any) => html`<b>${x}</b>
    <i>y</i>
    <b>${x}</b>
    <i>y</i>
    <b>${x}</b>`,
  '2ef7bde608ce5404e97d5f042f95f89f1c232871': `Hello World!`,
  ec9363251079b8d4e90ef45dbee061ed3832bc1f: html`Hello <b><i>World!</i></b>`,
  f82ed8f9eb0757dcc1350b71bfeb1a74e9b434af: (name: any) => `Hello ${name}!`,
};
