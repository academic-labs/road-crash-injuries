Note: Take these as heuristics and helpful notes, no need to follow them 100% always

## Preattentive attributes:

* Orientation  
* Shape  
* Line Length  
* Line Width  
* Size  
* Curvature  
* Added Marks  
* Enclosure  
* Hue  
* Intensity  
* Spatial Positioning  
* Motion

## Chartability Critical Heuristics

Perceivable: Users must be able to easily identify content using their senses: sight, sound, and touch.  
No:

* Low contrast  
* Content is only visual  
* Small text size  
* Visual presents seizure risk

Operable: All controls must be error-tolerant, discoverable, and multi-modal (not just mouse operable, but using keyboard, etc).  
No:

* Interaction modality has only one input type  
* No interaction cues or instructions  
* Controls override Assistive Technology controls

Understandable: Any information or data are presented without ambiguity, with clarity, and in a way that minimizes cognitive load.  
No:

* No explanation for purpose or how to read  
* No title, summary, or caption  
* Reading level inappropriate

Compromising: (Understandable, yet Robust): Information flows must provide transparency, tolerance, and consideration for different ways that users with assistive technologies and disabilities will prefer to consume different information.  
No:

* No table

Assistive: (Understandable and Perceivable but labor-reducing): Interface must be intelligent and multi-sensory in a way that reduces the cognitive and functional labor required for use  
No:

* Data density is inappropriate  
* Navigation and interaction is tedious

Flexible: (Perceivable and Operable, yet Robust): Design must respect user settings from user agents (browsers, operating systems, applications) and provide presentation and operation control.  
No:

* User style change not respected

## In addition

Textual:  
Purpose and how to read chart explained

* Introduction section  
* Legend

Information reading grade level  
For general public users:

* Check that reading level is at level 9 or lower

Responsive Text Size:  
Chart text size should be at least 12px (other text should be at least 16px)

Colour blindness  
Double Encoding  
Colour plus something else

* Different shape  
* Different pattern

Data Density  
Too much overlapping data

* Explanation of cluster  
* Aggregate to make fewer elements

Screen readers  
Users need to access information in visualisation  
Does not need to be identical experience

Navigation  
Via click or keyboard navigation (e.g. tab)

SVG container  
Screen readers can read axis labels  
But no other information  
Provide meta data for visualization  
Add meta data tags to the SVG container:

* \<title\> and  
* \<desc\> (for description of SVG)

Screen reader reads out to user

## Munzner Nested Levels of Design

Munzner, T. (2014). Visualization analysis and design. CRC press  
Why and what:

* Domain situation  
* Data/Task abstraction

How:

* Visual encoding/interaction idiom  
* Algorithm

## Inspection Visualisation Heuristics (Zuk & Carpendale, 2006\)

1\. Ensure visual variable has sufficient length  
2\. Don’t expect reading order from color  
3\. Color perception varies with size of items  
4\. Local contrast affects color and gray perception  
5\. Consider people with color blindness  
6\. Pre-attentive benefits increase with field of view  
7\. Quantitative assessment requires position or size variation  
8\. Preserve data to graphic dimensionality  
9\. Put the most data in the least space  
10\. Remove the extraneous (ink)  
11\. Consider Gestalt Laws  
12\. Provide multiple levels of detail  
13\. Integrate text wherever relevant

Tasks  
Usability Evaluation Tasks

* Provide the user with a goal (i.e., something to do)  
* Write in the user’s language (i.e., don’t use terms particular to your interface)  
* To assess Task Completion you need to have clear completion criteria  
* Do NOT provide instructions about how to complete the task using your interface

## Some Helpful References

Munzner, T. (2014). *Visualization analysis and design.* A K Peters/CRC Press. [https\://doi.org/10.1201/b17511](https://doi.org/10.1201/b17511) 

Nielsen, J. (1994). *10 usability heuristics for user interface design.* Nielsen Norman Group. [https\://www\.nngroup.com/articles/ten-usability-heuristics/](https://www.nngroup.com/articles/ten-usability-heuristics/) 

Tufte, E. R. (2001). *The visual display of quantitative information* (2nd ed.). Graphics Press.

World Wide Web Consortium. (2018). *Web content accessibility guidelines (WCAG) 2.1.* [https\://www\.w3.org/TR/WCAG21/](https://www.w3.org/TR/WCAG21/) 

## My Personal Notes

In addition, I think it’d be helpful to identify and answer these questions, including, but not limited to, the following suggestions, which may be adapted, supplemented, or disregarded as appropriate:  
**“Who is the intended audience?”**  
**"What appears to be the purpose/message of the charts?"**  
"What data do they appear to be encoding and how are they encoding it (marks and channels)?"  
"Are there any interactive features? If so, what are they and how are they used?"  
"What features do they use to try to get their message across?"  
"What can the charts help us know more about and why does it matter?"  
"Why these specific charts/ interactive features? (Provide justifications)"  
"What are the advantages and disadvantages of each chart?"  
etc.

Particularly, though a dashboard can have these 2 types of charts, it is important for me to identify and distinguish between:   
“**What do we want the audience to know?**” and “**What does the audience want to know?**”  
