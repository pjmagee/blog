Title: Blazor & SVG files - Part 2
Published: 2020-02-17
Tags:
  - C#
  - Blazor
  - SVG Files
---

It's been a while since my last blog post about Blazor.  My original blog post was showing how to use Blazer client side only with SVG files, by requesting those images using a http client from the browser and getting the content from the wwwroot.

But what if you are using `services.AddServerSideBlazor();`?

My solution was to make use of `IWebHostEnvironment`, and inject this into the registered `SvgService`. Doing this, you get access to the `WebRootFileProvider`, from there you can query other sub folders within the `wwwroot`.

<script src="https://gist.github.com/pjmagee/98b0995581ebbb7ea9d64a21863e0d43.js"></script>

Now with the `SvgService` defined, which is a collection of svg's for different technology stacks, you can pass this into any `Component`.

Using `@inject`, `[Inject]` or `@inherits OwningComponentBase` you can get an instance of the `SvgService`, and use it to render the svg.

### Example markup

```html
<td class="@item.Kind.GetIconClass() text-center">@SvgService.GetSvg(item.Kind)</td>
```

### Example component code

```c#
@code
{
    [Inject]
    SvgService SvgService { get; set; }
}
```

The `GetSvg` function has an enum parameter, using the new `C# 9 switch syntax` it accesses the raw SVG contents stored in the Dictionary as `MarkupString`, which Blazor knows how to render properly on the page.

```c#
public MarkupString GetSvg(EcosystemKind kind) => kind switch
{
    EcosystemKind.Docker => svgs["docker"],
    EcosystemKind.Gradle => svgs["gradle"],
    EcosystemKind.Maven => svgs["java"],
    EcosystemKind.Npm => svgs["npm"],
    EcosystemKind.NuGet => svgs["nuget"],
    EcosystemKind.PyPi => svgs["python"],
    EcosystemKind.RubyGem => svgs["ruby"],
    _ => Empty
};
```

For something this simple with no user/request specific data, this can be registered as a `Singleton` instance and shared to all components.

```c#
    private static IServiceCollection RegisterRazorComponentServices(this IServiceCollection services) => services
            .AddSingleton<SvgService>() // Share this same SVG service across ALL components
            .AddScoped<NavigationService>();
```

## Improving on this solution

The next step would be figure out if you can make the SVG Service, an easy to use sharable Blazor component itself, something such as `<CustomSvg Kind="enum" />`


<blockquote class="imgur-embed-pub" lang="en" data-id="mlo3eJH"><a href="//imgur.com/mlo3eJH">View post on imgur.com</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

<blockquote class="imgur-embed-pub" lang="en" data-id="lyZoaYN"><a href="//imgur.com/lyZoaYN">View post on imgur.com</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>

<blockquote class="imgur-embed-pub" lang="en" data-id="9dhvv0e"><a href="//imgur.com/9dhvv0e">View post on imgur.com</a></blockquote><script async src="//s.imgur.com/min/embed.js" charset="utf-8"></script>