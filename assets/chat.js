/* Grand Ascension - Golden Ascension chat widget
   Knowledge base + visitor screener. No backend, no API keys, all client-side.
   Professional tone: answers what it knows, says so when it does not. */
(function () {
  "use strict";

  var PHONE_DISPLAY = "(617) 639-7775";
  var PHONE_TEL = "tel:+16176397775";
  var KEYWORD_DISPLAY = "617-639-7975";
  var KEYWORD_SMS = "sms:+16176397975?&body=CREDIT";

  /* Full-AI mode: leave "" to use the built-in knowledge base only. Set it to
     the Grand Ascension /site-chat endpoint, e.g.
     "https://your-bot.onrender.com/site-chat", to pass messages to the AI
     brain. If the endpoint is unreachable, we fall back to the local brain. */
  var CHAT_ENDPOINT = "";
  var BOOK = "https://calendly.com/grandascensionllc/30min";
  var EMAIL = "grandascensionllc@gmail.com";

  var FAQ = [
    {
      keys: ["pricing", "price", "cost", "how much", "package", "packages", "fee", "pay", "starter", "fresh", "complete", "200", "450", "750", "plan"],
      reply:
        "Three packages:\n\n- Starter / Credit Analysis: $200\n- Fresh Start / Dispute: $450\n- Complete Repair: $750\n\nEvery package includes a written credit improvement plan and debt validation letters. Which one fits you?",
    },
    {
      keys: ["what can", "fix", "remove", "negative", "late", "payment", "collection", "repo", "closed", "inquiry", "hard", "challenge", "dispute", "disputes", "scratch"],
      reply:
        "We build personal dispute strategies for the items holding your score down:\n- Late payments\n- Collections and past-due accounts\n- Repossessions\n- Closed accounts\n- Hard inquiries (up to 10 removed on the Fresh Start package)\n\nStart free to see what can be challenged on your report.",
    },
    {
      keys: ["process", "how it works", "how does", "steps", "step", "start process", "begin"],
      reply:
        "Here is how it works:\n1. Free 30-minute consultation. We go over your report and goals.\n2. Credit analysis and a personal dispute strategy, item by item.\n3. We run dispute rounds with debt validation letters and you follow your written improvement plan.\n\nYou can start with the free consult at no cost.",
      link: BOOK,
      linkLabel: "Book Free Consultation",
    },
    {
      keys: ["how long", "long does", "time", "weeks", "months", "when", "timeline"],
      reply:
        "Time depends on how many items are on your report and how the bureaus respond. Disputes run in rounds, and early movement usually shows in the first few weeks. Your written plan lays out the timeline for your specific report.",
    },
    {
      keys: ["book", "schedule", "appointment", "calendar", "reserve", "pick a time", "consult"],
      reply: "Great. Book your free 30-minute consultation here:",
      link: BOOK,
      linkLabel: "Book Free Consultation",
    },
    {
      keys: ["text", "creditsms", "sms", "message", "keyword"],
      reply:
        "Text the word CREDIT to " + KEYWORD_DISPLAY + " and we reach out with your free 30-minute consultation.",
    },
    {
      keys: ["free", "30 minute", "30-min", "30 min", "cost anything", "free consult"],
      reply: "Yes, the first 30-minute consultation is free. We review your report together and lay out exactly what can be challenged. Book a time:",
      link: BOOK,
      linkLabel: "Book Free Consultation",
    },
    {
      keys: ["email", "mail"],
      reply: "Email us anytime at " + EMAIL + ".",
    },
    {
      keys: ["phone", "call", "number", "contact", "reach", "human", "person", "talk"],
      reply: "Call or text " + PHONE_DISPLAY + ", or text the word CREDIT to " + KEYWORD_DISPLAY + " and we reach out fast.",
    },
    {
      keys: ["who", "founder", "jelinsky", "alteus", "owner", "about", "story", "mentor", "degree", "started", "history", "background"],
      reply:
        "Grand Ascension was started by Jelinsky Alteus. He graduated with a Finance degree, struggled to pick his path, got a mentor, read, and learned credit inside and out, especially the laws that govern it. That understanding became this business. The full story is on the About page:",
      link: "https://ari-builds.github.io/grand-ascension/about.html",
      linkLabel: "Read Our Story",
    },
    {
      keys: ["guarantee", "guaranteed", "results", "score go", "how fast", "improve", "worth", "legit", "scam", "real", "trust", "ripoff"],
      reply:
        "We never promise a specific number. Individual results vary, and any company that promises a fixed score is not being straight with you. What we do promise is a written plan, personal dispute letters, and a process run item by item. Your score moves when entries are corrected and updated.",
    },
    {
      keys: ["funding", "loan", "lender", "mortgage", "finance assistance", "capital", "business loan"],
      reply:
        "Grand Ascension also offers funding assistance and financial consulting. Clean up your report first, then we can talk about the path to financing. That work starts with the free consultation.",
      link: BOOK,
      linkLabel: "Book Free Consultation",
    },
    {
      keys: ["law", "legal", "fcra", "regulation", "govern", "bureau", "credit bureau", "fair credit"],
      reply:
        "Disputes run under the credit reporting rules that protect consumers, which is why a written dispute process matters. Jelinsky studied the laws that govern credit closely, and your plan is built around them. For legal advice beyond that, you would want a licensed attorney.",
    },
    {
      keys: ["blog", "articles", "posts", "coming soon", "read"],
      reply: "The blog is coming soon. We are writing on credit education, the dispute process, and building a stronger credit profile. Check back, or start with a free consult in the meantime:",
      link: BOOK,
      linkLabel: "Book Free Consultation",
    },
    {
      keys: ["slogan", "motto", "tagline"],
      reply: "Better Credit. Brighter Future.",
    },
    {
      keys: ["hi", "hello", "hey", "sup", "help", "start", "what can you", "options", "menu"],
      reply:
        "I am the Grand Ascension assistant. I can answer questions about pricing, disputes, the process, our story, or run a quick 30-second check to see if we can help. Pick a topic below or type your question.",
    },
  ];

  var SENSITIVE = /social security|ssn|card number|credit card number|debit|account number|routing|pin|password|passcode|bank login/;

  var SCREENER_STEPS = [
    { ask: "What's your first name?", field: "name" },
    { ask: "What's your phone number?", field: "phone" },
    {
      ask: "What's on your report? Pick any that apply.",
      field: "report",
      chips: ["Late payments", "Collections", "Reposessions", "Closed accounts", "Hard inquiries", "Not sure"],
    },
  ];

  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstChild;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  var body, screen;

  function build() {
    var shell = el(
      '<div>' +
        '<button id="gaChatOpen" aria-label="Chat with Grand Ascension">' +
        '<span class="dot"></span><span>Ask us anything</span></button>' +
        '<div id="gaChat" role="dialog" aria-label="Grand Ascension chat">' +
        '  <div class="ga-head">' +
        '    <div class="ga-id"><span class="av">GA</span>' +
        '      <span class="ga-who"><b>Grand Ascension</b><span>Credit repair, replies fast</span></span>' +
        "    </div>" +
        '    <button class="ga-close" aria-label="Close chat">&times;</button>' +
        "  </div>" +
        '  <div class="ga-body"></div>' +
        '  <div class="ga-in"><input type="text" placeholder="Type a question..." aria-label="Message"><button aria-label="Send">&#10148;</button></div>' +
        "</div>" +
        "</div>"
    );
    document.body.appendChild(shell);
    var openBtn = document.getElementById("gaChatOpen");
    var chat = document.getElementById("gaChat");
    body = chat.querySelector(".ga-body");
    var input = chat.querySelector("input");

    openBtn.addEventListener("click", function () {
      if (chat.classList.contains("open")) {
        close();
        return;
      }
      chat.classList.add("open");
      if (!body.dataset.started) {
        body.dataset.started = "1";
        botMsg(
          "Hi, I'm the Grand Ascension assistant. Ask me about pricing, disputes, the process, or our story, and I'll give you a straight answer.",
          function () {
            chips(
              ["Pricing & packages", "What can be disputed", "How long does it take?", "Our story", "Book a consult"],
              handle
            );
          }
        );
      }
      input.focus();
    });
    chat.querySelector(".ga-close").addEventListener("click", close);

    var submit = function () {
      var v = input.value.trim();
      if (!v) return;
      userMsg(v);
      input.value = "";
      route(v);
    };
    chat.querySelector(".ga-in button").addEventListener("click", submit);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") submit();
    });
  }

  function close() {
    document.getElementById("gaChat").classList.remove("open");
  }

  function botMsg(text, then) {
    typing(function () {
      var b = el('<div class="ga-bubble ga-bot"></div>');
      b.innerHTML = esc(text);
      body.appendChild(b);
      body.scrollTop = body.scrollHeight;
      if (then) then();
    });
  }

  function botAction(text, actions) {
    typing(function () {
      var b = el('<div class="ga-bubble ga-bot"></div>');
      b.innerHTML = esc(text);
      body.appendChild(b);
      var act = el('<div class="ga-act"></div>');
      actions.forEach(function (a) {
        var btn = el('<a class="btn ' + (a.primary ? "btn-gold" : "btn-ghost") + '" target="_blank" rel="noopener"></a>');
        btn.textContent = a.label;
        btn.href = a.href;
        act.appendChild(btn);
      });
      body.appendChild(act);
      body.scrollTop = body.scrollHeight;
    });
  }

  function typing(then) {
    var t = el('<div class="ga-bubble ga-bot ga-typing"><i></i><i></i><i></i></div>');
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
    setTimeout(function () {
      t.remove();
      then();
    }, 400 + Math.random() * 300);
  }

  function userMsg(text) {
    body.appendChild(el('<div class="ga-bubble ga-user"></div>')).textContent = text;
  }

  function chips(list, onPick) {
    var c = el('<div class="ga-chips"></div>');
    list.forEach(function (label) {
      var b = el('<button class="ga-chip"></button>');
      b.textContent = label;
      b.addEventListener("click", function () {
        userMsg(label);
        onPick(label);
      });
      c.appendChild(b);
    });
    body.appendChild(c);
    body.scrollTop = body.scrollHeight;
  }

  /* ------------------------------------------------------------------ */
  /*  Routing.  Professional, knows what it knows and what it does not.  */
  /* ------------------------------------------------------------------ */

  function route(text) {
    var n = text.toLowerCase();

    if (screen && screen.step !== undefined && screen.step < SCREENER_STEPS.length) {
      screenStepInput(text);
      return;
    }

    /* Never take or repeat sensitive data. */
    if (SENSITIVE.test(n)) {
      botMsg(
        "Please don't share sensitive numbers here, and never email them either. No one at Grand Ascension will ask for your Social Security number, card numbers, or bank details in a chat. A real consultant will only request what is needed during a secure consultation."
      );
      botAction("Book the free consult and talk to a human who can guide you safely:", [
        { label: "Book Free Consultation", href: BOOK, primary: true },
        { label: "Text 'CREDIT'", href: KEYWORD_SMS },
      ]);
      return;
    }

    if (/book|schedule|appointment|reserve|calendar|start|sign me|qualify|check|help me|begin|free consult|screener/.test(n)) {
      startScreener();
      return;
    }

    /* The assistant can read your report? No. Be honest, then solve it. */
    if (/my score|my report|check my|what is my|pull my|my credit/.test(n)) {
      botMsg(
        "I can't pull your report, and I won't guess a score. That is exactly why the consultation is free. A consultant looks at your report and tells you what can be challenged, straight and honest."
      );
      botAction("Book a free 30-minute consult:", [
        { label: "Book Free Consultation", href: BOOK, primary: true },
      ]);
      return;
    }

    /* Scope: big personal finance calls are for a human. */
    if (/should i (buy|rent|lease|borrow|take)|loan approval|can i get (a|an)|advice on|is it a good (time|idea)/.test(n)) {
      botMsg(
        "I can answer questions about credit repair and the process, but a big financial decision deserves careful advice on your full picture. That is best done with your consultant in a session."
      );
      botAction("Book a free 30-minute consult:", [
        { label: "Book Free Consultation", href: BOOK, primary: true },
      ]);
      return;
    }

    /* Praise, thanks, small talk. */
    if (/thanks|thank you|thx|appreciate|ok|okay|great|awesome|cool|perfect|nice|good phone/.test(n)) {
      botMsg("Happy to help. Anything else about pricing, disputes, the process, or our story?");
      return;
    }

    var hit = null;
    FAQ.forEach(function (f) {
      var hits = 0;
      f.keys.forEach(function (k) {
        if (n.indexOf(k) !== -1) hits++;
      });
      if (hits > 0 && (!hit || hits > hit.hits)) hit = { hits: hits, f: f };
    });

    if (hit) {
      if (hit.f.link) {
        botAction(hit.f.reply, [{ label: hit.f.linkLabel || "Open", href: hit.f.link, primary: true }]);
      } else {
        botMsg(hit.f.reply);
      }
      if (/price|package|how much|cost|worth|legit|scam/.test(n)) {
        chips(["Book a free consult", "Ask another question"], handle);
      }
      return;
    }

    /* Full-AI mode: route free-form questions to the bot brain, keep the
       honest hand-off as the fallback. */
    askAi(text, localUnknown);
  }

  function localUnknown(text) {
    botMsg(
      "I don't have a solid answer for that one, and I won't make one up. The right move is a free 30-minute consult where you can ask it directly."
    );
    chips(["Book a consult", "Pricing & packages", "What can be disputed", "Our story"], handle);
  }

  /* Full-AI path. Sends the message to the bot's /site-chat endpoint, which
     runs the same strict guardian brain as the Telegram bot. Falls back to
     the local knowledge base on any failure. */
  function askAi(text, fallback) {
    if (!CHAT_ENDPOINT) { fallback(); return; }
    try {
      fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-GA-Origin": "chat-widget" },
        body: JSON.stringify({ message: text }),
      })
        .then(function (r) { if (!r.ok) throw new Error("bad status"); return r.json(); })
        .then(function (d) { botMsg(String(d.reply || "").trim() || "No answer right now. A real consultant can help."); })
        .catch(function () { fallback(); });
    } catch (e) { fallback(); }
  }

  function handle(text) {
    route(text);
  }

  /* ------------------------------------------------------------------ */
  /*  Screener.  NLP-lite: collects name, phone, report items.           */
  /* ------------------------------------------------------------------ */

  function startScreener() {
    screen = { data: {}, step: 0, report: [] };
    botMsg("Great, let's do a quick check. Three questions, about 30 seconds.", askStep);
  }

  function askStep() {
    if (screen.step >= SCREENER_STEPS.length) {
      finishScreen();
      return;
    }
    var s = SCREENER_STEPS[screen.step];
    botMsg(s.ask, function () {
      if (s.chips) {
        chips(s.chips.concat(["Something else / not sure"]), handleReportChip);
      }
    });
  }

  function handleReportChip(word) {
    if (screen.report.indexOf(word) === -1 && word !== "Something else / not sure" && word !== "Not sure") {
      screen.report.push(word);
      chips(["Add more", "That's everything"], handleReportDone);
      return;
    }
    screen.step++;
    askStep();
  }

  function handleReportDone(word) {
    screen.step++;
    askStep();
  }

  function screenStepInput(text) {
    var s = SCREENER_STEPS[screen.step];
    if (s.field === "name") {
      screen.data.name = text;
    } else if (s.field === "phone") {
      screen.data.phone = text;
    } else if (s.field === "report" && text && text !== "Something else / not sure" && text !== "Not sure") {
      if (screen.report.indexOf(text) === -1) screen.report.push(text);
      chips(["Add more", "That's everything"], handleReportDone);
      return;
    }
    screen.step++;
    askStep();
  }

  function finishScreen() {
    botAction(
      "You're all set, " + esc(screen.data.name || "friend") + ". Here's the move:\n\n" +
        "Book a free 30-minute consultation and we'll review your report together.",
      [
        { label: "Book Free Consultation", href: BOOK, primary: true },
        { label: "Text 'CREDIT'", href: KEYWORD_SMS },
      ]
    );
    botMsg("Or text the word CREDIT to " + KEYWORD_DISPLAY + " and we reach out to you.", function () {
      chips(["Book it", "Close"], handleFinish);
    });
  }

  function handleFinish(word) {
    if (word === "Book it") {
      botAction("Perfect. Pick a time that works for you:", [
        { label: "Book Free Consultation", href: BOOK, primary: true },
      ]);
    } else {
      close();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else {
    build();
  }
})();