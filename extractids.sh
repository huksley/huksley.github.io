#!/bin/bash

grep id= index.html | sed -e "s/.* id=\"//g;s/\"\>/,/g;s/<.*//g;s/\(.*\)RU,\(.*\)/RU,\1,\2/g;s/\(.*\)EN,\(.*\)/EN,\1,\2/g" > ids.csv
