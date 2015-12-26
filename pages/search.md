---
layout: page
show_meta: false
title: "Search"
permalink: "/search/"
header:
  image_fullwidth: "train_7.jpg"
---

{% include google_search.html %}

<form style="padding-bottom: 200px;" onsubmit="google_search()" >
  <input type="text" id="google-search" placeholder="{{ site.data.language.enter_search_term }}">
</form>