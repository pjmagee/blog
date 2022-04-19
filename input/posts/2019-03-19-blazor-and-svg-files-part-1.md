Title: Blazor & SVG files - Part 1
Published: 2019-03-19
Tags:
  - C#
  - SVG Files
  - Razor
---

I've been experimenting with Blazor and using Bootstrap with SVG's. For Angular I remember that the Material design library had a really nice way of being able to pull in SVG files but this doesn't quite yet exist for blazor.

I was really keen on using some SVG's from [Simple Icons](https://simpleicons.org/) which contains loads of SVG's based on popular brands.  

Well, you're probably thinking, what do you mean "nice way of pulling in SVG files". You just use the `<img>` tag and in the `src` attribute just throw in the path to the svg file that is served from the server. Well, it's not the easy if you wan't to manipulate or style your SVG, since you cant do that by using the `<img>` tag approach. There are other solutions that use `jQuery` to load that file and then replace the `<img>` tag with the actual raw `<svg>` but it was just so many lines of code and also it didnt seem like a good solution for my problem because I don't really want to use `jquery` unless i reeaaallly need to, since i want to write the least amount of js as possible.  

Here is a quick way of directly loading raw SVG files through a Helper which you can `@inject` into your blazor pages. This way, you only need to call the files once, load them in as `MarkupString` and they will be output as Raw html.

<script src="https://gist.github.com/pjmagee/b4bc15a8325065f48412a230df453b01.js"></script>