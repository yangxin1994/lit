import * as fs from 'fs';
import {generateMsgId} from '../id-generation.js';

function makeTemplate(i, isHtml) {
  let id, template;
  if (isHtml) {
    template = `html\`Hello <b>${i}</b>!\``;
    id = generateMsgId([`Hello <b>${i}</b>!`], true);
  } else {
    template = `\`Hello ${i}!\``;
    id = generateMsgId([`Hello ${i}!`], false);
  }
  return {id, template};
}

function generateHtml({
  isHtml,
  numTemplates,
  numRenders,
  autoId,
  isTransformed,
}) {
  const renderCalls = [];

  for (let i = 0; i < numTemplates; i++) {
    const {template, id} = makeTemplate(i, isHtml);
    const options = autoId ? `` : `, {id: '${id}'}`;
    const call = isTransformed ? template : `msg(${template}${options})`;
    renderCalls.push(
      `      render(${call}, document.getElementById('d${i}'));`
    );
  }

  const imports = [];
  imports.push(`  import {render${isHtml ? ', html' : ''}} from 'lit-html';`);
  if (!isTransformed) {
    imports.push(`  import {msg, configureLocalization} from '@lit/localize';`);
  }

  const html = `<!doctype html>

<script type="module">
${imports.join('\n')}

  (async () => {
${
  isTransformed
    ? ''
    : `
    const {setLocale} = configureLocalization({
      sourceLocale: 'en',
      targetLocales: ['en', 'en2'],
      loadLocale: (locale) => import(\`./\${locale}.js\`),
    });
    await setLocale('en2');
`
}
    for (let i = 0; i < ${numRenders}; i++) {
      const div = document.createElement('div');
      div.id = \`d\${i}\`;
      document.body.append(div);
    }

    performance.mark('render-start');

    for (let i = 0; i < ${numRenders}; i++) {
${renderCalls.join('\n')}
      if (i === 0) {
        performance.measure('first-render', 'render-start');
      }
    }

    performance.measure('all-renders', 'render-start');
  })();
</script>
`;

  return html;
}

function generateLocaleModule({numTemplates, isHtml}) {
  const entries = [];
  for (let i = 0; i < numTemplates; i++) {
    const {id, template} = makeTemplate(i, isHtml);
    entries.push(`  '${id}': ${template},`);
  }
  const js = `import {html} from 'lit-html';

export const templates = {
${entries.join('\n')}
};
`;
  return js;
}

// html-100-100-auto
fs.writeFileSync(
  'html-100-100-auto/index.html',
  generateHtml({
    isHtml: true,
    numTemplates: 100,
    numRenders: 100,
    autoId: true,
    isTransformed: false,
  }),
  'utf8'
);

fs.writeFileSync(
  'html-100-100-auto/en2.js',
  generateLocaleModule({
    isHtml: true,
    numTemplates: 100,
  }),
  'utf8'
);

// html-100-100-baked
fs.writeFileSync(
  'html-100-100-baked/index.html',
  generateHtml({
    isHtml: true,
    numTemplates: 100,
    numRenders: 100,
    autoId: false,
    isTransformed: false,
  }),
  'utf8'
);

fs.writeFileSync(
  'html-100-100-baked/en2.js',
  generateLocaleModule({
    isHtml: true,
    numTemplates: 100,
  }),
  'utf8'
);

// html-100-100-transformed
fs.writeFileSync(
  'html-100-100-transformed/index.html',
  generateHtml({
    isHtml: true,
    numTemplates: 100,
    numRenders: 100,
    autoId: false,
    isTransformed: true,
  }),
  'utf8'
);
