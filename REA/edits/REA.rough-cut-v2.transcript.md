# REA rough cut v2: transcript for review

This is the exact spoken text of the v2 cut (Descript transcript, verbatim, 10:37 long). Tell me edits by line number, for example `L014: remove`, `L021: replace with ...`, `L030: move before L025`.
Names are normalised in this copy: REA, Wekan, Claude Code. (The transcript tool sometimes writes Ria, weekend and Cloud.)

## Already fixed in v2 (from 13:36 down to 10:37)

- 48 false starts, stutters and repeats removed (every 'uh', 'f-', 'gun--', 'sh--', doubled lines, and so on).
- 'old DOS game' removed: now 'the sound panning of DX Ball'. 'which app you rebuilt' is correct (you did say rebuilt).
- Long pauses shortened to about 0.35 s. Voice cleaned with Descript Studio Sound at 90% (noise floor -47 to -59 dB).
- The sentence 'You need to install Node.js, Terminal, Claude Code...' that was cut by mistake is back (L132).

## Still in the cut (small, your call)

- 'and it is, free and open source' (L007): a small stumble is left.
- 'because because you sign in' (L050): doubled word.
- 'number two, i- it studies' (L134): one stutter.
- Descript's AI credits ran out, so these three were not fixed. I can fix them once credits are back, or you can delete them in Descript.

## Transcript

| Line | Time | Text |
|---|---|---|
| L001 | 0:00 | Hey guys, have you ever seen a cool feature in some app and thought, "I want this in my own project," but you have no idea how it is built? |
| L002 | 0:00 | Well, this is a tool for exactly that right now everyone in the AI and developer world is talking about. |
| L003 | 0:00 | It is called Reverse Engineer Anything. |
| L004 | 0:00 | Yes, this is the real name, REA for short. |
| L005 | 0:22 | So now look at this. |
| L006 | 0:22 | On GitHub, it has almost four hundred thousand stars. |
| L007 | 0:22 | That is a crazy number for a developer tool, and it is, free and open source. |
| L008 | 0:22 | So what is it? |
| L009 | 0:22 | Simple. |
| L010 | 0:22 | you see a feature you like in an app. |
| L011 | 0:22 | Your AI agent, like Claude Code, uses REA to inspect that app, explain how it works, show you the evidence, and then help you build your own version. |
| L012 | 0:47 | And people are doing some wild things with it. |
| L013 | 0:47 | some traced how the Notion desktop app handles copy and paste all the way from the screen to the main process. |
| L014 | 0:47 | People rebuild the sound panning of DX Ball, and checked it against the original. |
| L015 | 1:01 | And one guide shows how to record a web app session and turn it into a practical environment for all the AI agents. |
| L016 | 1:01 | So why the hype? |
| L017 | 1:01 | I think there are three reasons for it. |
| L018 | 1:01 | One, it is free and open source for everyone. |
| L019 | 1:01 | Two, it works on many things like websites, apps, even old binaries. |
| L020 | 1:01 | And three, it shows evidence for every findings With AI, that matters a lot because we all know AI can make things up. |
| L021 | 1:28 | But when you ask me, "Is it really that good?" Today, I will test it for you. |
| L022 | 1:28 | I will use it to study a real app and then rebuild my own version with just few prompts. |
| L023 | 1:28 | And stay with me until the end of this video because I will tell you honestly what worked, what did not, and downsides nobody's talking about. |
| L024 | 1:47 | Oh, and by the way, I'm Kalyan. |
| L025 | 1:47 | And this is AI with Kalyan where I share simple, practical AI you can try today. |
| L026 | 1:47 | If you like this, tap subscribe. |
| L027 | 1:47 | It really helps. |
| L028 | 1:47 | Okay, let's go. |
| L029 | 1:47 | Let me explain what we are going to do. |
| L030 | 1:47 | In simple words, why I picked Wekan. |
| L031 | 1:47 | I needed a real app to study. |
| L032 | 2:06 | Wekan is an open source Kanban board, a bit like Trello. |
| L033 | 2:06 | If you have never used one, you have columns like to do, doing and done. |
| L034 | 2:06 | Inside each column you have cards, and those are your tasks. |
| L035 | 2:06 | When the work moves forward, you drag the card to the next column. |
| L036 | 2:06 | It has a public demo that anyone can open, and it has an MIT license, which means it is open source. |
| L037 | 2:31 | So I'm not touching anything private. |
| L038 | 2:31 | And there is one more reason, A Kanban app has a lot of behavior inside. |
| L039 | 2:31 | Drag and drop, labels, due dates, checklists, saving data. |
| L040 | 2:31 | So it is great test for REA. |
| L041 | 2:45 | What we are trying to achieve I'm not trying to copy the whole Wekan. |
| L042 | 2:45 | that would take a lot of time and big team and a lot of prompts. |
| L043 | 2:45 | My goal is a small working version, my own app, which I will call REA Board. |
| L044 | 2:45 | It will have columns, cards, drag and drop, color labels, due dates with the red overdue badge, and checklists. |
| L045 | 3:06 | It will save the data only in my browser, so it will not have login real-time sync between users or a server. |
| L046 | 3:06 | In simple words, the expectation is this: a working copy of how the board behaves with my own name and design, not the full product. |
| L047 | 3:06 | Okay, now the setup. |
| L048 | 3:06 | First, what we need before we start. |
| L049 | 3:26 | So I'm using a Windows laptop. |
| L050 | 3:26 | So Claude Code needs Windows ten or the newer version, an internet connection, a Claude account because because you sign in the first time you use Claude Code. |
| L051 | 3:26 | So the next step is open the PowerShell and type this command |
| L052 | 3:43 | And wait for it to finish, then close the terminal and open it again. |
| L053 | 3:43 | Now type this to check it worked. |
| L054 | 3:43 | Type Claude hyphen hyphen version. |
| L055 | 3:43 | If you see a version number, Claude Code is installed. |
| L056 | 3:43 | the first time you run it, it opens your browser, so you can sign in with your Claude account. |
| L057 | 4:01 | Just sign in and come back. |
| L058 | 4:01 | Next is to check your node version. |
| L059 | 4:01 | REA needs Node.js, and Claude Code does not. |
| L060 | 4:01 | So this check matters. |
| L061 | 4:01 | REA needs node version twenty-two or twenty-four or the newer version. |
| L062 | 4:01 | If you get an older version or an error, install the latest node from nodejs.org, then check again. |
| L063 | 4:22 | In the REA setup, Type this command, and it may ask okay to proceed. |
| L064 | 4:22 | Type yes. |
| L065 | 4:22 | And then it asks which agent you want. |
| L066 | 4:22 | I choose Claude Code. |
| L067 | 4:22 | Then it shows a list of changes it will make. |
| L068 | 4:22 | Read it and say yes. |
| L069 | 4:22 | and this is very important. |
| L070 | 4:22 | It will offer to install Hopper. |
| L071 | 4:40 | Say no, because we are only working with websites, so we do not need it. |
| L072 | 4:40 | The next step is restart Claude Code and check REA. |
| L073 | 4:40 | If the Claude Code is open, close it, then type this, Claude MCP list. |
| L074 | 4:40 | You should see REA in the list. |
| L075 | 4:40 | If you see it, REA is connected. |
| L076 | 4:40 | Add the Chrome extension. |
| L077 | 4:40 | Install the Claude in the Chrome extension from the Chrome Web Store. |
| L078 | 5:05 | This lets Claude test the app in a real browser. |
| L079 | 5:05 | If you want the link, I'll put the link in the description below. |
| L080 | 5:05 | So the next step is make a project folder and start Claude Code. |
| L081 | 5:05 | Type these two lines, then start Claude. |
| L082 | 5:05 | And that is it. |
| L083 | 5:05 | Now the real fun begins. |
| L084 | 5:05 | here I'm giving the Wekan board demo link |
| L085 | 5:26 | And saying it is a web app, so use only the website analysis tools. |
| L086 | 5:26 | Do not touch desktop app tools. |
| L087 | 5:26 | Do not build anything yet. |
| L088 | 5:26 | So in simple words, I said like, "Study this app, but do not build anything yet." And my favorite trick here is the last line. |
| L089 | 5:26 | I asked Claude to label every point as observed, inferred, or not sure, so it does not just guess. |
| L090 | 5:51 | While Claude is working on this, here is a question for you. |
| L091 | 5:51 | Think about the apps on your phone right now. |
| L092 | 5:51 | Which app would you love to rebuild as your own version? |
| L093 | 5:51 | Maybe a to-do app, a habit tracker, a notes app. |
| L094 | 5:51 | Write in the comments below. |
| L095 | 5:51 | I will read them, and the best ideas can be my next video. |
| L096 | 6:10 | Okay, let's see what Claude found. |
| L097 | 6:10 | And look at this. |
| L098 | 6:10 | It explains how the lists and cards are structured, how drag and drop works, and where the data is stored. |
| L099 | 6:10 | And the labels observed, inferred, and not sure, this is what makes it trustworthy. |
| L100 | 6:25 | This is the part that normally takes hours. |
| L101 | 6:25 | So now that Claude knows how the app works, it's time to build. |
| L102 | 6:25 | Notice one thing. |
| L103 | 6:25 | I tell Claude to use only how the app behaves. |
| L104 | 6:25 | My own name, my own sample content. |
| L105 | 6:25 | I'm not copying anyone's logo, text or images. |
| L106 | 6:25 | That is very important. |
| L107 | 6:44 | And now this part takes a few minutes, so I'll speed it up. |
| L108 | 6:44 | And remember, stay till the end because after this I will tell you the honest downside. |
| L109 | 6:44 | Okay, here it is, guys. |
| L110 | 6:44 | This is my REA board running on my computer. |
| L111 | 6:44 | Let me show you what it built. |
| L112 | 7:00 | First columns, I can add a column, rename it, and delete it. |
| L113 | 7:04 | So the next cards I can add a card, edit it and delete it. |
| L114 | 7:10 | and the fun part is drag and drop. |
| L115 | 7:10 | Drag a card to another column and with the real mouse drag, and then reorder it inside the column, and it works. |
| L116 | 7:10 | Then the extras: color labels, a due date in the past, and see the red overdue badge, a checklist with a progress bar, the side panel for editing a card. |
| L117 | 7:30 | And if I refresh a page, everything is still saved. |
| L118 | 7:30 | here is how close it looks to the original. |
| L119 | 7:30 | Now, what it did not build, and this part is very important. |
| L120 | 7:30 | So my app saves data only in this browser, so there is no login, no real-time sync between users, and no server or database. |
| L121 | 7:49 | the original Wekan has all of that, and my version does not. |
| L122 | 7:49 | I did not ask for it in my prompts, so Claude did not build it. |
| L123 | 7:57 | So it is a working copy of how the board behaves, not a full replacement of the real product. |
| L124 | 7:57 | Okay, so now the question I promised you, is REA worth the hype? |
| L125 | 7:57 | My honest answer is yes. |
| L126 | 7:57 | It is worth trying. |
| L127 | 8:12 | For web apps, going from I like this feature to I understand how it works, and I have a working version in two prompts is really powerful. |
| L128 | 8:12 | And the evidence labels observed, inferred, and not sure, That is what I really like the most. |
| L129 | 8:12 | But it is not magic. |
| L130 | 8:30 | Here are the downsides. |
| L131 | 8:30 | Number one is setup is not one click. |
| L132 | 8:34 | You need to install Node.js, Terminal, Claude Code, and for testing the Chrome extension. |
| L133 | 8:40 | If you are a complete beginner, it will take some effort. |
| L134 | 8:40 | number two, i- it studies what a website shows from the outside. |
| L135 | 8:40 | it cannot see the private code running on the company's server. |
| L136 | 8:51 | So you get the behavior, not the full product. |
| L137 | 8:51 | Number three is result depends on your prompt. |
| L138 | 8:51 | If you are vague, you get a vague app, and you still have to test the output yourself. |
| L139 | 8:51 | Do not trust it blindly. |
| L140 | 8:51 | Number four is the tool changes very fast, so some steps may look different when you try it. |
| L141 | 9:11 | And please remember, use this only on apps you own, open source apps, or when you have permission. |
| L142 | 9:11 | learn from them and build your own. |
| L143 | 9:11 | Do not copy other people's work. |
| L144 | 9:11 | So my verdict is that hype is mostly real for learning and prototyping. |
| L145 | 9:11 | Now the best part, guys, this method is not only for the Kanban boards. |
| L146 | 9:32 | Step one: Ask Claude to study it with reverse engineering anything and report it with evidence. |
| L147 | 9:32 | Step two is to ask Claude to build your own version, match their look, test it with the real browser. |
| L148 | 9:32 | A to-do app, a notes app, a habit tracker, a booking page, anything. |
| L149 | 9:49 | Just change the website link and the feature list in the prompts. |
| L150 | 9:49 | So here is my homework for you. |
| L151 | 9:49 | Pick one app, copy two prompts from the description below, change the link and try it today. |
| L152 | 9:49 | Then tell me in the comments below which app you rebuilt. |
| L153 | 9:49 | If you like this video, please hit the like button. |
| L154 | 9:49 | It really helps. |
| L155 | 10:08 | If you know a friend who is learning AI or wants to build apps, share this video with them. |
| L156 | 10:08 | And if you have not subscribed yet, please subscribe to AI with Kalyan and press the bell icon, so you do not miss the next video. |
| L157 | 10:08 | More AI tutorials are coming, and I make them for you. |
| L158 | 10:08 | And if you want to see how I edit my videos using Claude, that video is right here. |
| L159 | 10:31 | Click on it and watch it next. |
| L160 | 10:31 | Thank you so much for watching. |
| L161 | 10:31 | I will see you in the next one. |
| L162 | 10:31 | Bye. |
