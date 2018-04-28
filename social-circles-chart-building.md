# This document describes algorithm of building of social circles chart

## Terms

* _Node_ - node is anonymized data about the single person.
* _Attribute_ - attribute is piece of information about the single person.
  Node can have several attributes of different type, also some attributes can have few values.
  Attribute has a key and a value. Attribute key also known as _attribute type_.
  Attributes are arranged into hierarchy:
    * education type -> education degree,
    * work location -> work position
    * language -> locale
    * location -> hometown

  Child attributes are clarification of the parent attributes and considered in scope of parent.


## General information about arc building

Arc is built using D3 `arc` functionm which generates data for SVG `d` attribute of `path` tag.
To build an arc following information is required:
* _Start angle_ - an angle in radians where arc starts. 0 rad is top point of the circle.
* _End angle_ - an angle (in radians) where arc ends.
* _Inner radius_ - a radius of arc inner bounding circle.
* _Outer radius_ - a radius of arc outer bounding circle.


```
                      outer radius
                          V
                ----------------------
start angle ->  |                     | <- end angle
                ----------------------
                          A
                     inner radius
```

## Building a social circles chart

Social circles chart consists of two charts: primary and secondary circles chart.
Primary visualizes attribute type groups:
* education
* work
* language
* location

Secondary includes some attributes under attribute groups:
* education: education type -> education degree
* work: work location -> work position
* language: language id -> locale anonymized
* location: location id -> hometown id


Note that primary and secondary attributes builds hierarchy,
and child attributes are considered in scope of parent attributes and attribute groups.

### Building primary social circle chart

Primary social circle chart indicates ratio between all attribute type groups.

```
Patg = Natg/N,                                           (1)

where
Patg - part of attribute group
Natg - number of attributes of group in all nodes
N - number of all attributes in all nodes
```

Now, knowing parts of each attribute type group, we could build a chart:

1. Starting from first group, calculate a data for arch building: start angle and end angle.
   Inner and outer radius considered predefined.
2. Start angle is equal to previous end angle, or `0` for first attribute group.
3. `A = 2*π * Patg`, where A - attribute group arc angle, Patg calculated from (1)
4. `End angle = Start angle + A`

### Building secondary social circle chart

Secondary social circle chart represets ratio between values of attribute of one type (and their children types),
and also overlapping between them if any.

Secondary social circle arcs always fit into parent's bounds (into parent start and end angle).

Overlapping between charts represets a number of nodes which have both attribute values at the same time.

Chart building algorithm is recursive, general algorithm plan is next:
* Build attribute tree: a data structure with attribute group at first level, attribute type at next and related nodes on each level. This tree preserves parent-child relations of the nodes.
* Calculates start and end angles of the arcs tree, either for attribute group and for attribute values, including overlapping
* Calculate arcs radiuses with care about children
* Calculate arc colors and bounding boxes if needed
* Put arcs in SVG using D3


#### Calculating arc angles

Calculating arc angles is most complex and crucial part of algorithm, other parts are pretty trivial and straightforward.

Let use the following names:

```
Psa - parent arc start angle
Pea - parent arc end angle

SA - start angle of the arc;
EA - end angle of the arc;
SAprev - start angle of the previous built arc, SAprev = Psa for the first arc;
EAprev - end angle of the previous built arc, EAprev = Pea for the first arc.
```

* Arc chart is built by levels. Level is arcs for values of one attribute type.
* Determine the bounding of the level. Bounding of the level is start and end angles of the parent arc, or of attribute group arc.
* Determine the parent attribute. Note that parent is attribute type and attribute value, not only the attribute type.
  For example if we build chart for **education degree**, there will be different data for children of
  **education type: High school** and **education type: College**.
* Determine nodes for the level. It is all nodes which have attribute of the given type and parent attribute (with corresponding type and value). Next we will operates with these node subset only.

* For each attribute value:
   * Determine part of attribute value: `R = Nav/N`,

     where

     R - part of attribute values
     Nav - number of given attribute values within node subset
     N - number of attributes of certain type on node subset

   * Determine size of angle for the arc: `A = (Pea - Psa) * R `
   * Determine overlapping with previous arc: `O = (Pea - Psa) * N2/N`,

     where

     N2 - number of nodes where both attribute values presente
     N - number of attributes on certain type on node subset


    * Determine start angle. `SA = Pea - O`
    * Determine end angle: `EA = SA + A`
    * Check if end angle is out of bounds of parent arc.
    * If arc is out of bounds, then arc flipping is used:

           `EA = Psa + O`
           `SA = EA - A`

      Note it is possible that arc would be out of parent bounds either overlapping with start or end of previous arc.


* Build a next level of attribute hiearachy using calculated values as bounds.