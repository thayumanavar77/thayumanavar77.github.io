---
layout: default
show_meta: false
title: ""
permalink: "/traces/"
header:
  image_fullwidth: "train_7.jpg"
---
<h1>Physical (Run/Swim/Cycle!!!)</h1>
<h3>21K Runs</h3>
<ul class="21K">
  {% for tr in site.traces %}
    {% if tr.distance == "21K" %}
       <li><a href="{{ tr.url }}">{{ tr.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
<h3>10K Runs</h3>
<ul class="10K">
  {% for tr in site.traces %}
    {% if tr.distance == "10K" %}
       <li><a href="{{ tr.url }}">{{ tr.title }}</a></li>
    {% endif %}
  {% endfor %}
</ul>
<h3>Short Runs (< 10K :-))</h3>
<ul class="Short">
   {% for tr in site.traces %}
     {% if tr.distance == "short" %}
       <li><a href="{{ tr.url }}">{{ tr.title }}</a></li>
     {% endif %}
   {% endfor %}
</ul>
