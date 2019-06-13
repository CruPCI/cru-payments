// require all spec files
const testsContext = require.context('.', true, /.*\.spec\.ts$/); // eslint-disable-line no-undef
testsContext.keys().forEach(testsContext);
