/* Grand Ascension - Golden Ascension chat widget
   FAQ answers + visitor screener. No backend, no API keys, all client-side. */
(function () {
  "use strict";

  var PHONE_DISPLAY = "(617) 639-7775";
  var PHONE_TEL = "tel:+16176397775";
  var KEYWORD_DISPLAY = "617-639-7975";
  var KEYWORD_SMS =
    "sms:+16176397975?&body=Hi%20Grand%20Ascension%2C%20I%27d%20like%20a%20free%20credit%20consultation.";
  var BOOK = "https://calendly.com/grandascensionllc/30min";
  var EMAIL = "grandascensionllc@gmail.com";

  var FAQ = [
    {
      keys: ["pricing", "price", "cost", "how much", "package", "packages", "fee", "pay", "starter", "fresh", "complete", "200", "450", "750"],
      reply:
        "Three packages:\n\n- Starter / Credit Analysis: $200\n- Fresh Start / Dispute: $450\n- Complete Repair: $750\n\nEvery package includes a written credit improvement plan and debt validation letters. Which one fits you?",
    },
    {
      keys: ["dispute", "what can", "fix", "remove", "negative", "late", "payment", "collection", "repo", "closed", "inquiry", "hard", "challenge"],
      reply:
        "We build personal dispute strategies for the items holding your score down:\n- Late payments\n- Collections and past-due accounts\n- Repossessions\n- Closed accounts\n- Hard inquiries (up to 10 removed on the Fresh Start package)\n\nStart free to see what can be challenged on your report.",
    },
    {
      keys: ["how long", "long does", "time", "weeks", "months", "when"],
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
      keys: ["text", "sms", "message", "keyword"],
      reply: "Text the word CREDIT to " + KEYWORD_DISPLAY + " and we reach out with your free 30-minute consultation.",
    },
    {
      keys: ["free", "30 minute", "30-min", "30 min", "cost anything"],
      reply: "Yes, the first 30-minute consultation is free. We review your report together and lay out exactly what can be challenged. Book a time:",
      link: BOOK,
      linkLabel: "Book Free Consultation",
    },
    {
      keys: ["email", "mail"],
      reply: "Email us anytime at " + EMAIL + ".",
    },
    {
      keys: ["phone", "call", "number", "contact", "reach", "human", "person"],
      reply: "Call or text " + PHONE_DISPLAY + ", or text the word CREDIT to " + KEYWORD_DISPLAY + " and we reach out fast.",
    },
    {
      keys: ["who", "founder", "jelinsky", "alteus", "owner", "about"],
      reply:
        "Grand Ascension is founded by Jelinsky Alteus, a Credit and Funding Consultant. He helps people with bad credit, or anyone who wants help managing their finances, build a plan toward financial stability.",
    },
    {
      keys: ["guarantee", "results", "score go", "how fast", "improve"],
      reply:
        "Individual results vary, and we never promise a specific number. What we do promise is a written plan, personal dispute letters, and a process run item by item.",
    },
    {
      keys: ["slogan", "motto", "tagline"],
      reply: "Better Credit. Brighter Future.",
    },
    {
      keys: ["hi", "hello", "hey", "sup", "help", "start", "what can you", "options"],
      reply:
        "I can answer questions about pricing, disputes, and how Grand Ascension works, or run a quick 30-second check to see if we can help. Pick a topic below or type your question.",
    },
  ];

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
    document.body.appendChild(shell.firstChild);
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
          "Hi, I'm the Grand Ascension assistant. I can answer questions about pricing and credit disputes, or run a quick check to see if we can help.",
          function () {
            chips(["Pricing & packages", "What can be disputed", "How long does it take?", "Book a consult", "Talk to a human"], handle);
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
    }, 450 + Math.random() * 350);
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

  function route(text) {
    var n = text.toLowerCase();

    if (screen && screen.step !== undefined && screen.step < SCREENER_STEPS.length) {
      screenStepInput(text);
      return;
    }

    if (/book|schedule|appointment|reserve|calendar|start|sign me|qualify|check|help me|begin|free consult/.test(n)) {
      startScreener();
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
      if (/book|schedule|appointment|pricing|package|how much|cost/.test(n)) {
        chips(["Book a free consult", "Ask another question"], handle);
      }
      return;
    }

    botMsg("I didn't catch that. I'm best at pricing, disputes, and the process. Try one of these:");
    chips(["Pricing & packages", "What can be disputed", "How long does it take?", "Book a consult"], handle);
  }

  function handle(text) {
    route(text);
  }

  /* ---- screener ---- */
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
    if (word === "Add more") {
      screen.step++; // skip report question; let them type more
      routeInputMapped();
    } else {
      screen.step++;
      askStep();
    }
  }

  function routeInputMapped() {
    screen.step = SCREENER_STEPS.length;
    finishScreen();
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
      "You're all set, " + esc(screen.data.name || "friend") + ". Here's your move:\n\n" +
        "Book a free 30-minute consultation and we'll review your report together.",
      [
        { label: "Book Free Consultation", href: BOOK, primary: true },
        { label: "Text 'CREDIT'", href: KEYWORD_SMS },
      ]
    );
    botMsg("Or send us your info now and we follow up with you:", function () {
      chips(["Send my info", "Just book it", "Close"], handleFinish);
    });
  }

  function handleFinish(word) {
    if (word === "Send my info") {
      var name = screen.data.name || "my name";
      var phone = screen.data.phone || "";
      var report = screen.report.length ? screen.report.join(", ") : "not sure what's on it";
      var text =
        "Hi Grand Ascension, this is " + name + (phone ? " (phone " + phone + ")" : "") + ". From your site chat: " + report + ". I'd like a free consultation.";
      botAction("Tap the button below and your message opens ready to send.", [
        { label: "Open my messages", href: "sms:+16176397975?&body=" + encodeURIComponent(text), primary: true },
        { label: "Book instead", href: BOOK },
      ]);
    } else if (word === "Just book it") {
      botAction("Perfect. Pick a time that works for you:", [{ label: "Book Free Consultation", href: BOOK, primary: true }]);
    } else {
      close();
    }
  }

  document.addEventListener("DOMContentLoaded", build);
})();