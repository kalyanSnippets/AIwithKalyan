# REA v2: shooting script (from Kalyan, 30 Oct 2026)

Footage: Drive folder "Video -2" (`1OUojrUDw0WQk_CU-tVKRjAexffHeyLTQ`). Plan: [`REA-v2.plan.md`](REA-v2.plan.md).

## 1. Hook (0:00 - 0:35)

This one tool has over FOUR HUNDRED THOUSAND stars on GitHub.
Four hundred thousand! Crazy, no?
It's called REA. Reverse Engineer Anything.
It lets AI open any app, measure it, and rebuild it.
And today, I gave it ONE link...
and eighteen minutes later, it built THIS.

[SHOW: two boards side by side, big text "Which one is real?"]

Can you tell which one is the real app?
Stay till the end, because I'll show you both, side by side.
And I'll tell you honestly... is it worth the hype?
I'm Kalyan, welcome to AI with Kalyan!
Okay, let's go!

## 2. What is REA, and why the hype (0:35 - 1:30)

[SHOW: github.com/morluto/rea in the browser, address bar visible. Zoom on Stars, then Forks]

Okay, so first, what is REA?
This is the GitHub page. Look at the stars, over four hundred thousand.
And the forks, over one hundred thousand.
And it's free, MIT license. Anyone can use it.
It went from almost nothing... to over three hundred thousand stars in about two weeks!
And YouTube videos about it got millions of views.
So why is everyone so crazy about it?
Basically, REA connects your AI agent... like Claude Code or Codex...
to the real reverse engineering tools that experts use.
So the AI can open an app, look inside it, trace how it works...
and come back with proof.
And everything runs locally, on your own computer.

[SHOW: text cards, one per example, with the view counts or numbers on screen]

Now, what are people actually building with it?
One guy took a Steam game he owns...
and turned it back into C# code for a Unity project, in just thirty minutes!
That post got around four hundred and sixty thousand views.
Somebody pointed it at Blender, the famous 3D software...
and it went through over three hundred thousand functions in about seventy minutes!
Another person rebuilt a sound function from the old game DX-Ball,
and matched all three thousand two hundred and five test cases.
And someone traced how the clipboard works inside the Notion app.
Wild, right?
So the big question is... is it real, or just hype?
Let's find out.

## 3. Today's mission (1:30 - 2:05)

[SHOW: Wekan board, slow scroll across lists and cards. Text: "Mission: clone this board"]

So, what are we building today?
See this app? It's a kanban board.
Lists, cards, labels, due dates, checklists, drag and drop.
Lots of small details, right?
It's open source, MIT license, and the demo is free to look at.
My mission is simple.
Give Claude Code ONE link to this board...
and ask it to build a copy. Same layout, same colours, same behaviour.
But one rule, guys.
We are NOT stealing anything.
I told Claude, no name, no logo, no images from them.
Our app has its own name... REA Board. With our own sample data.
So, can REA really pull this off?
Let's see!

## 4. Subscribe hook (2:05 - 2:20)

[SHOW: small subscribe button animation]

And before we start, one small request.
If you want me to clone more apps like this,
hit that subscribe button. It's free, and it really helps this small channel.
Okay? Let's start!

## 5. Setup, step by step (2:20 - 3:20)

[SHOW: PowerShell, zoomed in. Show each command as big text]

I'm on Windows, using PowerShell.
First, go to your Documents folder. `cd $HOME\Documents`
Now, make a new folder for the project. `mkdir kanban-rea-demo`
And go inside it. `cd kanban-rea-demo`
Now, the main step. Install REA. Just one command. `npx rea-agents`
See this? It detects Claude Code and Codex.
Then it asks, "Install the guided REA skill?" I say Yes.
And look... "REA is ready for local app analysis." Easy, no?
Next, we connect REA to Claude Code. `claude mcp add rea -- cmd /c npx -y rea-agents@latest mcp`
And let's check it. `claude mcp list`
Boom! Connected.
Now, start Claude Code. `claude`
First time, it asks for a theme. I pick dark mode.
Then you sign in with your Claude account in the browser.
I'm using Opus 5.5, with auto mode on.
Auto mode means Claude handles the permissions by itself.
So I'm not clicking "yes" every two seconds. Nice!

## 6. The prompt (3:20 - 4:50)

[SHOW: paste the prompt into the terminal, it shows "Pasted text +46 lines". Then show it section by section, highlight MEASURE FIRST and TESTING]

Okay, now the most important part. The prompt.
And honestly, this is the real secret.
Pause the video and copy it, or take it from the description.
[Don't read it all aloud. Just say: "I'm pasting this in now."]

> Using what you learned from the REA analysis of this Wekan demo board:
> https://boards.wekan.team/b/D2SzJKZDS4Z48yeQH/wekan-r-open-source-kanban-board-with-mit-license
>
> Build a faithful clone of its board screen in this folder. Name it "REA Board". Match the layout, colours, fonts, spacing and behaviour as closely as you can. Do not use Wekan's name, logo or images, and write your own sample text and artwork.
>
> STACK
>
> React 19 + Vite, no UI library, plain CSS, native HTML5 drag and drop, state in one reducer file, everything saved in localStorage.
>
> MEASURE FIRST, DON'T GUESS
>
> Open the live demo and measure: page and header colours, font family and sizes, list width and gap, list header style, card radius, shadow and padding, label colour palette, badge colours, avatar size. Put them in one CSS variables block and use them everywhere.
>
> BOARD SCREEN
>
> - Top bar with the board title, a board menu area and member avatars.
> - Horizontal row of lists that scrolls sideways. An "Add list" control at the end.
> - Lists: title, card count, a WIP limit shown like (4/3) with the count in red when over the limit, a menu to rename, collapse and delete. Collapsed lists show as thin vertical strips.
> - Cards (minicards): auto ID (RB-1, RB-2...), title, several coloured labels, four date badges (received, start, due, end) where due turns red when overdue, a cover image drawn with CSS, member avatars (4 sample people), and a checklist badge with a percentage and progress bar.
> - "Add card" at the bottom of each list.
>
> CARD DETAIL PANEL (opens when a card is clicked)
>
> Edit title and description, labels (multiple), all four dates, members, cover colour, and checklists where items tick from the card itself.
>
> INTERACTIONS
>
> - Drag cards between lists and reorder inside a list, with a visible drop position. Handle both dragenter and dragover so real mouse drags work, and keep the layout stable while dragging.
> - Drag lists to reorder them.
> - Add, rename, delete lists and cards. Pressing Escape while typing must not lose the edit (blur the field first so it commits).
> - Refresh keeps everything.
>
> DATA
>
> Ship my own sample board with about 4 lists and 8 cards. Add an "Add sample lists" button that only APPENDS the sample lists. Never overwrite saved data, and migrate old saved data to any new format.
>
> TESTING
>
> Run the dev server, then in a real browser use real mouse drags (not only scripted events) to test every feature. Tick an item only if you saw it work. Back up localStorage before testing and restore it afterwards. Then show a side-by-side screenshot of the original and mine, list the 5 biggest remaining differences, and fix the top 2.

Now, why does this prompt work? Four things, okay?
One. "Measure first, don't guess." Claude opens the real app, and takes real numbers. Not "looks like blue". The exact colour code.
Two. The stack is fixed. React, Vite, plain CSS. No random libraries.
Three. I describe every part of the screen. Lists, cards, the card panel, drag and drop.
And four... my favourite. Testing. I told Claude, "Tick an item only if you SAW it work."
Why? Because AI loves to say "done", right? So we make it prove it.
Okay, I press Enter. And now... we wait.

## 7. Claude works (4:50 - 5:40)

[SHOW: sped-up footage, 3-4x. Timer overlay ending at "18m 17s". Zoom on each file name]

So now Claude is working. And this part is really interesting.
First, it checks the folder. Empty.
Then it uses REA's browser tools to open the live board... and measure it.
It finds Chrome on my laptop, and sets up a small Playwright toolkit.
That's like a robot that can control a browser.
Then it starts writing code. Look, file after file!
The Avatar. The Minicard, around one fifty-six lines.
The List, around two ten lines.
A drag and drop hook, around one fifty-seven lines.
And a huge CSS file, with every measured value in one place.
Font is Roboto, fourteen pixels.
Then it builds the project... forty-three modules, no errors!
And then it tests everything with a real mouse, in a real Chrome window.
I've sped this up, but in real life, the whole thing took eighteen minutes.

## 8. Comment hook (5:40 - 6:00)

[SHOW: freeze on "All 50 checks passed". Text: "Guess the match %? Comment below"]

And it's done! Claude says, all fifty checks passed.
But wait, before I show you... I want you to guess.
How close do you think this copy is to the real app?
Fifty percent? Eighty? Ninety?
Tell me in the comments! I will read every guess.
Okay, ready? Let's see it.

## 9. The reveal: Wekan vs REA Board (6:00 - 8:10)

[SHOW: split screen. Left "ORIGINAL" Wekan, right "REA BOARD" localhost:5173. Circle each thing as you mention it. Then go full screen on REA Board]

On the left, the original board. On the right, our REA Board.
Same layout? Let's see.
Look at the top bar. Blue, with the board menu, and four avatars.
Below it, the orange strip.
And see this red "four slash three" on the first list?
That's the work in progress limit. It turns red when there are too many cards.
Claude even copied that!
Now the cards. IDs like RB-1, RB-2. Coloured labels. Date badges.
This one says "9 days overdue", in red.
Checklists with progress bars.
And these cover images? Drawn only with CSS. No image files at all!
But hey, looking nice is not enough, right?
Does it actually work? Let me test it.

[SHOW: live test in the REA Board tab]

I click "Add list". I type "kanban board". Add. Works!
Now "Add card". "Card creation is in progress".
Click on it... and the detail panel opens!
Labels, members, date picker, cover colours, description, checklists.
I pick the Platform and Demo labels. Choose Milo Chen as the member.
Pick a sunset cover. Close it.
Look at that! The card has everything on it.
Now the big test. Drag and drop.
I drag this card from Review to Done... works!
Another one into my new list... works!
I can even drag a whole list to a new place.
Now, delete a card. It asks, "Delete this card for good?" with a "Keep it" button. Nice touch!
And "Add sample lists"? It only adds the lists. It does not delete my work.
Exactly what I asked in the prompt.
Honestly, I'm really impressed. All of this, from ONE prompt.

## 10. My honest opinion (8:10 - 9:10)

[SHOW: you on screen, or a calm terminal shot. Text: "Worth the hype?" then three ticks, then one "but". Flash the GitHub star count for a second]

So... is REA really worth the hype?
Let me be honest, that's why you're here.
My answer is... yes. It's worth trying. Three reasons.
One. It measures, it does not guess. That's the big difference.
Two. It doesn't just look nice, it really works. Drag and drop, saving, the card panel, everything.
Three. Claude tested its own work. Fifty checks, with a real mouse.
But, there's a "but". Let me be fair.
REA is not magic.
My prompt was very detailed, and I think that's why the result was so good.
A lazy prompt gives you a lazy result.
Also, it took eighteen minutes.
And it copied only one screen, the board screen. Not the full app.
And some people online are asking, "What does REA add on top of an AI agent using normal tools?"
So the hype is running a little ahead of the proof.
One more thing, please.
Only clone apps you're allowed to clone. Like open source ones.
Never copy their name, logo, or images.
Use REA to learn, and to build your own ideas.
So my verdict? Try it. But do it the right way.

## 11. Outro + previous video (9:10 - 9:50)

[SHOW: end screen. Point to the previous video card: "How I edit videos with Claude". Subscribe button animation. Hold 20 seconds]

Okay guys, that's it for today!
If you liked this, please subscribe to AI with Kalyan.
I'm going to test more AI tools like this, and show you what really works.
Now, comment time! Which app should I clone next?
Spotify? A notes app? Something else? Tell me in the comments!
And don't forget to share your guess, how close was the copy?
Also, if you want to see how I edit my videos using Claude...
my previous video is right here. Click on it! I'm sure you'll like it.
Thank you so much for watching.
See you in the next one. Bye guys!
