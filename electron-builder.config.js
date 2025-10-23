/**
 * Electron Builder 配置 - 桌面冒險者
 */
module.exports = {
  appId: 'com.yourstudio.desktopRPG',
  productName: '桌面冒險者',

  directories: {
    output: 'dist',
    buildResources: 'assets'
  },

  files: [
    'main.js',
    'game.js',
    'index.html',
    'src/**/*',
    'assets/**/*',
    'package.json',
    'node_modules/**/*',
    '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
    '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
    '!**/node_modules/*.d.ts',
    '!**/node_modules/.bin',
    '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
    '!.editorconfig',
    '!**/._*',
    '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
    '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
    '!**/{appveyor.yml,.travis.yml,circle.yml}',
    '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}',
    '!tests',
    '!coverage',
    '!.git',
    '!Dockerfile',
    '!docker-compose.yml',
    '!*.sh',
    '!CLAUDE.md',
    '!*.md'
  ],

  win: {
    target: [
      {
        target: 'portable',
        arch: ['x64']
      }
    ],
    icon: 'assets/icon.ico'
  },

  portable: {
    artifactName: '桌面冒險者-portable.exe'
  },

  mac: {
    target: ['dmg'],
    icon: 'assets/icon.ico',
    category: 'public.app-category.games'
  },

  linux: {
    target: ['AppImage'],
    icon: 'assets/icon.ico',
    category: 'Game'
  },

  extraMetadata: {
    main: 'main.js'
  }
};
