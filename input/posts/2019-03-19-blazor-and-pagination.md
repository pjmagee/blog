Title: Blazor & Pagination
Published: 2019-03-18
Tags:
  - C#
  - Blazor
  - Pagination
---

The snippets below can be used to create a pagination razor component for a Bootstrap table with a pager.

When the pager component recieves a click event, it sends that event back to the parent page component, and calls the `PageAsync` function to get the requested page from the server.

We then call the `StateHasChanged()` function to ensure the component is rerendered and sent back to the client.

The last snippet shows the page component and the pager component is placed under the actual table where you would render the columns and rows for the Items.

The bootstrap markup is being rendered by using [BlazorStrap](https://github.com/chanan/BlazorStrap), a NuGet package which provides razor components that generate bootstrap 4 markup.

<script src="https://gist.github.com/pjmagee/69b10e448baa276486aa1641bd395be8.js"></script>