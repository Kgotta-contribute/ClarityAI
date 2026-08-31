
module.exports = {

    printWidth: 120,

    tabWidth: 2,

    useTabs: false,

    semi: true,

    singleQuote: true,

    trailingComma: 'es5',

    bracketSpacing: true,

    arrowParens: 'always',

    overrides: [

      {

        files: '*.ts',

        options: {

          parser: 'typescript',

          printWidth: 120,

          tabWidth: 2,

          useTabs: false,

          semi: true,

          singleQuote: true,

          trailingComma: 'es5',

          bracketSpacing: true,

          arrowParens: 'always'

        }

      },

      {

        files: '*.tsx',

        options: {

          parser: 'typescript',

          printWidth: 120,

          tabWidth: 2,

          useTabs: false,

          semi: true,

          singleQuote: true,

          trailingComma: 'es5',

          bracketSpacing: true,

          arrowParens: 'always'

        }

      },

      {

        files: '*.js',

        options: {

          printWidth: 200,

          tabWidth: 2,

          useTabs: false,

          semi: true,

          singleQuote: true,

          trailingComma: 'none',

          bracketSpacing: true,

          arrowParens: 'always'

        }

      }

    ]

  };

 