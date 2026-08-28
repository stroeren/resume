(() => {
  const VALID_PAGES = ['home', 'work', 'projects', 'about'];
  const LINKS = {
    resume: 'assets/resume.pdf',
    github: 'https://github.com/stroeren',
    linkedin: 'https://www.linkedin.com/in/stroeren/',
    devpost: 'https://devpost.com/stroeren',
    email: 'mailto:stroeren@gmail.com',
  };
  const MAX_LOG_LINES = 14;

  const pages = document.querySelectorAll('.page');
  const navLinks = document.querySelectorAll('.nav-link');
  const cwdEl = document.getElementById('cmd-cwd');
  const inputEl = document.getElementById('cmd-input');
  const logEl = document.getElementById('cmd-log');

  let log = [];

  function pageFromHash() {
    const hash = window.location.hash.replace('#', '');
    return VALID_PAGES.includes(hash) ? hash : 'home';
  }

  function setPage(page, { pushHash = true } = {}) {
    if (!VALID_PAGES.includes(page)) page = 'home';

    pages.forEach(section => {
      section.hidden = section.dataset.page !== page;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    cwdEl.textContent = page === 'home' ? '~' : '~/' + page;

    if (pushHash) {
      const newHash = page === 'home' ? '#home' : '#' + page;
      if (window.location.hash !== newHash) {
        window.location.hash = newHash;
      }
    }

    window.scrollTo(0, 0);
  }

  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      setPage(link.dataset.page);
    });
  });

  window.addEventListener('hashchange', () => setPage(pageFromHash(), { pushHash: false }));

  function renderLog() {
    logEl.innerHTML = '';
    log.forEach(line => {
      const div = document.createElement('div');
      div.className = 'cmd-log-line';
      div.textContent = line;
      logEl.appendChild(div);
    });
  }

  function pushLog(lines) {
    log = [...log, ...lines].slice(-MAX_LOG_LINES);
    renderLog();
  }

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    const prompt = '➜  ~ ' + raw;
    if (!cmd) return;

    const out = text => pushLog([prompt, text]);

    if (cmd === 'help') {
      return out("available:  ls · cd [work|projects|about|~] · whoami · cat about.txt · resume · github · linkedin · devpost · email · clear");
    }
    if (cmd === 'ls' || cmd === 'ls -la') {
      return out("work/    projects/    about/    resume.pdf    skills/");
    }
    if (cmd === 'whoami') {
      return out("spencer roeren — full-stack swe, oakland university '27");
    }
    if (cmd === 'clear') {
      log = [];
      return renderLog();
    }
    if (cmd === 'cat about.txt') {
      return out("backend + frontend, tests that catch things, containers that behave, scanners that stop bad code. currently senior year, graduating may 2027.");
    }
    if (cmd === 'sudo' || cmd.startsWith('sudo ')) {
      return out("nice try.");
    }
    if (cmd === 'resume' || cmd === 'cat resume.pdf' || cmd === 'open resume') {
      out('opening resume.pdf …');
      window.open(LINKS.resume, '_blank');
      return;
    }
    if (cmd === 'github') {
      out('→ github.com/stroeren');
      window.open(LINKS.github, '_blank');
      return;
    }
    if (cmd === 'linkedin') {
      out('→ linkedin.com/in/stroeren');
      window.open(LINKS.linkedin, '_blank');
      return;
    }
    if (cmd === 'email') {
      out('→ stroeren@gmail.com');
      window.location.href = LINKS.email;
      return;
    }
    if (cmd === 'devpost') {
      out('→ devpost.com/stroeren');
      window.open(LINKS.devpost, '_blank');
      return;
    }

    const dirs = {
      work: 'work', projects: 'projects', about: 'about',
      'work/': 'work', 'projects/': 'projects', 'about/': 'about',
      '~': 'home', '..': 'home', '~/': 'home',
    };
    if (cmd.startsWith('cd ')) {
      const target = dirs[cmd.slice(3).trim()];
      if (target) {
        pushLog([prompt]);
        setPage(target);
        return;
      }
      return out('cd: no such directory: ' + cmd.slice(3).trim());
    }

    out('zsh: command not found: ' + cmd.split(' ')[0] + " — try 'help'");
  }

  inputEl.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      runCommand(inputEl.value);
      inputEl.value = '';
    }
  });

  setPage(pageFromHash(), { pushHash: false });
})();
