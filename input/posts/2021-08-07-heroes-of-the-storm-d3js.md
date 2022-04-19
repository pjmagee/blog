Title: Heroes of the Storm and D3.js
Lead: A hierarchical edge graph
Published: 2021-07-08
Tags:
  - C#
  - Javascript
  - Heroes of the Storm
---

One of my favourite games is a hero brawler game called Heroes of the Storm. It's a 5 people versus 5 people game.  
There are 3 lanes on the map and the goal is to kill their core before they kill your core. 

The general layout of a map is usually split into 3 lanes. Every 30 seconds you have some minions that travel down the lanes and meet half way and the idea throughout the session is to what ever it costs to win. That could be team fights, gaining xp from minions, destroying enemy buildings, ganking enemies etc. There are many ways to win just as there are many ways to lose.
Heroes are unique units that players can control in the game that bring a unique style to how that team might win or lose. There are over 90 heroes to select from which can become extremely complicated for new players to learn and understand how to counter those heroes of they come up against them.

Heroes are split into several main categories: Tank, Bruiser, Ranged Assassin, Melee Assassin, Healer & Support. This is only a very high level view of the complexity of this game. 

When you break it down to how a hero's style and unique capabilties can bring something positive to a team, it will also depend on how well the hero performs on a certain map, and if their hero counters enemy heroes or if they also work well with other heroes in their team. 

There is a project on Github called HeroesToolChest by a guy named Kevin who has a tool that exports string data from the Game itself. Using this data, I was able to transform the information that is not always available even in the UI of the game and produce a hierarchical edge graph that can show relationships between different elements of the game.

Once I was able to extract all the required information to produce the graph, I went online and forked an example of d3.js that I could use as the foundation for displaying the data I wanted to show.

Selecting one of the edge nodes, such as Complexity, will allow you see all heroes that have been labeled with the same complexity.

![image](https://user-images.githubusercontent.com/292720/128598800-751da65d-2418-418a-afdc-ff345feb1d56.png)

You can also do the reverse by selecting an individual Hero and see all the other things that Hero relates to.

![image](https://user-images.githubusercontent.com/292720/128598831-88461845-27bb-4e76-b26b-f7501fcdf8dc.png)

<script src="https://gist.github.com/pjmagee/a3d58c994f38ca6e4d7bdde7312e29fa.js"></script>

[Checkout the full relationship graph on Observable HQ](https://observablehq.com/@pjmagee/heroes-of-the-storm-hero-relationships)
