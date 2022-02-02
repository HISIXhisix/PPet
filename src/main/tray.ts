import { config } from '@src/common'
import electron, {
  Tray,
  nativeImage,
  app,
  MenuItemConstructorOptions,
  MenuItem,
  shell,
  BrowserWindow,
  Menu,
} from 'electron'

import stripTrayIcon from '../../static/icons/strip-tray.png'
import trayIcon from '../../static/icons/tray.png'

const currentIcon = process.platform === 'darwin' ? stripTrayIcon : trayIcon

const langs = {
  zh: {
    alwaysOnTop: '@置顶',
    ignoreMouseEvents: '忽略点击',
    openAtLogin: '开机启动',
    plugins: '插件中心',
    tools: '小工具',
    language: '语言',
    zoomIn: '放大',
    zoomOut: '缩小',
    zoomReset: '原始大小',
    canvasSettings: '画布设置',
    clearSettings: '清除设置',
    importModel: '导入模型',
    importOnlineModel: '导入在线模型',
    removeModel: '移除模型',
    reRender: '重新渲染',
    debug: '调试',
    feedback: '反馈建议',
    about: '关于 PPet',
    quit: '退出 PPet',
    model: {
      title: '请选择模型配置文件',
      buttonLabel: '导入模型',
      filtersName: '模型配置文件',
    },
    errorBox: {
      title: '导入模型失败',
      title1: '移除模型失败',
      getContent: (text: string) =>
        `无效的model配置文件，该文件为'.json'结尾，会包含${text}等字段`,
    },
  },
  en: {
    alwaysOnTop: 'Always On Top',
    ignoreMouseEvents: 'Ignore Mouse Events',
    openAtLogin: 'Open At Login',
    plugins: 'Plugins',
    tools: 'Tools',
    language: 'Language',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    zoomReset: 'Zoom Reset',
    canvasSettings: 'Canvas Settings',
    clearSettings: 'Clear Canvas Settings',
    importModel: 'Import Model',
    importOnlineModel: 'Import Online Model',
    removeModel: 'Remove Model',
    reRender: 'ReRender',
    debug: 'Debug',
    feedback: 'Feedback',
    about: 'About PPet',
    quit: 'Quit PPet',
    model: {
      title: 'Please select model configuration file',
      buttonLabel: 'Import model',
      filtersName: 'model configuration file',
    },
    errorBox: {
      title: 'Import model failed',
      title1: 'Remove model failed',
      getContent: (text: string) =>
        `Invalid model configuration file. The file ends with '.json' and should contain fields such as ${text}`,
    },
  },
}

type langType = 'zh' | 'en'

let tray: electron.Tray

const initTray = (mainWindow: BrowserWindow) => {
  if (!tray) {
    tray = new Tray(nativeImage.createFromDataURL(currentIcon))
  }

  const handleClickLangRadio = (lang: langType) => {
    config.set('language', lang)
    initTray(mainWindow)
  }

  const alwaysOnTop = config.get('alwaysOnTop', true) as boolean
  const ignoreMouseEvents = config.get('ignoreMouseEvents', false) as boolean

  const lang = config.get(
    'language',
    app.getLocale().includes('zh') ? 'zh' : 'en',
  ) as langType

  const cl = langs[lang]
  mainWindow.setAlwaysOnTop(alwaysOnTop)
  mainWindow.setIgnoreMouseEvents(ignoreMouseEvents, { forward: true })

  const template: Array<MenuItemConstructorOptions | MenuItem> = [
    {
      label: cl.alwaysOnTop,
      type: 'checkbox',
      checked: alwaysOnTop,
      click: (item) => {
        const { checked } = item
        mainWindow.setAlwaysOnTop(checked)
        config.set('alwaysOnTop', checked)
      },
    },
    {
      label: cl.ignoreMouseEvents,
      type: 'checkbox',
      checked: ignoreMouseEvents,
      click: (item) => {
        const { checked } = item
        mainWindow.setIgnoreMouseEvents(checked, { forward: true })
        config.set('ignoreMouseEvents', checked)
      },
    },
    {
      label: cl.openAtLogin,
      type: 'checkbox',
      checked: app.getLoginItemSettings().openAtLogin,
      click: (item) => {
        const { checked } = item
        app.setLoginItemSettings({ openAtLogin: checked })
      },
    },

    {
      label: cl.language,
      type: 'submenu',
      submenu: [
        {
          label: '简体中文',
          type: 'radio',
          checked: lang === 'zh',
          click: handleClickLangRadio.bind(null, 'zh'),
        },
        {
          label: 'English',
          type: 'radio',
          checked: lang === 'en',
          click: handleClickLangRadio.bind(null, 'en'),
        },
      ],
    },

    {
      type: 'separator',
    },

    {
      label: cl.reRender,
      accelerator: 'CmdOrCtrl+r',
      click: () => {
        app.relaunch()
        app.exit(0)
      },
    },
    {
      type: 'separator',
    },
    {
      label: cl.debug,
      click: () => {
        mainWindow.webContents.openDevTools({ mode: 'undocked' })
      },
    },
    {
      type: 'separator',
    },
    {
      label: cl.feedback,
      click: () => {
        shell.openExternal('https://github.com/zenghongtu/PPet/issues')
      },
    },
    {
      label: cl.about,
      role: 'about',
    },
    {
      label: cl.quit,
      click: (item) => {
        app.quit()
      },
    },
  ]

  const menu = Menu.buildFromTemplate(template)

  tray.setContextMenu(menu)
}

export default initTray