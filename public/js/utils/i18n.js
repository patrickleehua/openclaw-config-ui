// OpenClaw Config Manager - Internationalization (i18n) Module

class I18n {
  constructor() {
    this.currentLang = 'en';
    this.translations = {};
    this.supportedLangs = ['en', 'zh'];
  }

  /**
   * Initialize i18n with saved preference or browser language
   */
  async init() {
    // Try to get saved language preference
    const savedLang = localStorage.getItem('openclaw-lang');

    if (savedLang && this.supportedLangs.includes(savedLang)) {
      this.currentLang = savedLang;
    } else {
      // Detect browser language
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang.startsWith('zh')) {
        this.currentLang = 'zh';
      } else {
        this.currentLang = 'en';
      }
    }

    await this.loadLanguage(this.currentLang);
    this.updatePageContent();
  }

  /**
   * Load language file
   */
  async loadLanguage(lang) {
    try {
      const response = await fetch(`/lang/${lang}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load language file: ${lang}`);
      }
      this.translations = await response.json();
      this.currentLang = lang;
      localStorage.setItem('openclaw-lang', lang);
    } catch (error) {
      console.error('Error loading language:', error);
      // Fallback to embedded English translations
      if (lang === 'en') {
        this.translations = this.getEmbeddedEnglish();
      } else {
        this.translations = this.getEmbeddedChinese();
      }
    }
  }

  /**
   * Switch language
   */
  async switchLanguage(lang) {
    if (!this.supportedLangs.includes(lang) || lang === this.currentLang) {
      return;
    }

    await this.loadLanguage(lang);
    this.updatePageContent();

    // Dispatch event for dynamic content
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  /**
   * Get translation by key
   */
  t(key, fallback = '') {
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }

    return value || fallback || key;
  }

  /**
   * Update all page content with current language
   */
  updatePageContent() {
    // Update elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = this.t(key);

      if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
        element.placeholder = translation;
      } else {
        element.textContent = translation;
      }
    });

    // Update elements with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
      const key = element.getAttribute('data-i18n-placeholder');
      element.placeholder = this.t(key);
    });

    // Update elements with data-i18n-title attribute
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
      const key = element.getAttribute('data-i18n-title');
      element.title = this.t(key);
    });

    // Update document language
    document.documentElement.lang = this.currentLang;
  }

  /**
   * Get current language
   */
  getCurrentLanguage() {
    return this.currentLang;
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages() {
    return this.supportedLangs;
  }

  /**
   * Embedded fallback translations (English)
   */
  getEmbeddedEnglish() {
    return {
      common: {
        overview: 'Overview',
        models: 'Models',
        agents: 'Agents',
        channels: 'Channels',
        skills: 'Skills',
        logs: 'Logs',
        config: 'Config',
        load: 'Load',
        reload: 'Reload',
        browse: 'Browse',
        auto: 'Auto',
        save: 'Save',
        add: 'Add',
        edit: 'Edit',
        delete: 'Delete',
        cancel: 'Cancel',
        confirm: 'Confirm',
        start: 'Start',
        stop: 'Stop',
        restart: 'Restart',
        refresh: 'Refresh',
        clear: 'Clear',
        search: 'Search',
        close: 'Close'
      },
      header: {
        configPath: 'Enter config file path or click Browse to select',
        gatewayStatus: 'Gateway Status',
        stopped: 'Stopped',
        running: 'Running',
        loaded: 'Loaded'
      },
      sidebar: {
        defaultModel: 'Default Model',
        notSet: 'Not set'
      },
      overview: {
        title: 'Overview',
        description: 'System overview and quick actions',
        activeModels: 'Active Models',
        activeAgents: 'Active Agents',
        activeChannels: 'Active Channels',
        activeSkills: 'Active Skills',
        gatewayManager: 'Gateway Manager',
        gatewayStatus: 'Gateway Status',
        gatewayPort: 'Gateway Port',
        configInfo: 'Config Info',
        version: 'Version',
        lastModified: 'Last Modified',
        authMode: 'Auth Mode',
        updateChannel: 'Update Channel',
        notRunning: 'Not running'
      },
      models: {
        title: 'Models',
        description: 'Manage model providers and configurations',
        addProvider: 'Add Provider',
        noConfig: 'No config loaded. Please load a config file first.'
      },
      agents: {
        title: 'Agents',
        description: 'Configure agent instances and defaults',
        addAgent: 'Add Agent',
        noConfig: 'No config loaded. Please load a config file first.'
      },
      channels: {
        title: 'Channels',
        description: 'Manage communication channels',
        addChannel: 'Add Channel',
        noConfig: 'No config loaded. Please load a config file first.'
      },
      skills: {
        title: 'Skills',
        description: 'Manage skill configurations',
        noConfig: 'No config loaded. Please load a config file first.'
      },
      logs: {
        title: 'Logs',
        description: 'View external log files',
        logPath: 'Enter log file path or click Browse to select',
        logContent: 'Log Content',
        file: 'File'
      },
      configTab: {
        title: 'Raw Config',
        description: 'View and edit raw configuration',
        saveConfig: 'Save Config',
        placeholder: 'Config JSON will appear here...'
      }
    };
  }

  /**
   * Embedded fallback translations (Chinese)
   */
  getEmbeddedChinese() {
    return {
      common: {
        overview: '概览',
        models: '模型',
        agents: '代理',
        channels: '通道',
        skills: '技能',
        logs: '日志',
        config: '配置',
        load: '加载',
        reload: '重新加载',
        browse: '浏览',
        auto: '自动',
        save: '保存',
        add: '添加',
        edit: '编辑',
        delete: '删除',
        cancel: '取消',
        confirm: '确认',
        start: '启动',
        stop: '停止',
        restart: '重启',
        refresh: '刷新',
        clear: '清空',
        search: '搜索',
        close: '关闭'
      },
      header: {
        configPath: '输入配置文件路径或点击浏览选择',
        gatewayStatus: '网关状态',
        stopped: '已停止',
        running: '运行中',
        loaded: '已加载'
      },
      sidebar: {
        defaultModel: '默认模型',
        notSet: '未设置'
      },
      overview: {
        title: '概览',
        description: '系统概览和快捷操作',
        activeModels: '活跃模型',
        activeAgents: '活跃代理',
        activeChannels: '活跃通道',
        activeSkills: '活跃技能',
        gatewayManager: '网关管理',
        gatewayStatus: '网关状态',
        gatewayPort: '网关端口',
        configInfo: '配置信息',
        version: '版本',
        lastModified: '最后修改',
        authMode: '认证模式',
        updateChannel: '更新通道',
        notRunning: '未运行'
      },
      models: {
        title: '模型',
        description: '管理模型提供商和配置',
        addProvider: '添加提供商',
        noConfig: '未加载配置。请先加载配置文件。'
      },
      agents: {
        title: '代理',
        description: '配置代理实例和默认值',
        addAgent: '添加代理',
        noConfig: '未加载配置。请先加载配置文件。'
      },
      channels: {
        title: '通道',
        description: '管理通信通道',
        addChannel: '添加通道',
        noConfig: '未加载配置。请先加载配置文件。'
      },
      skills: {
        title: '技能',
        description: '管理技能配置',
        noConfig: '未加载配置。请先加载配置文件。'
      },
      logs: {
        title: '日志',
        description: '查看外部日志文件',
        logPath: '输入日志文件路径或点击浏览选择',
        logContent: '日志内容',
        file: '文件'
      },
      configTab: {
        title: '原始配置',
        description: '查看和编辑原始配置',
        saveConfig: '保存配置',
        placeholder: '配置 JSON 将显示在这里...'
      }
    };
  }
}

// Create global instance
window.i18n = new I18n();

// Convenience function
window.t = (key, fallback) => window.i18n.t(key, fallback);
