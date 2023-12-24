## 1. Please list out changes in the directions of your project if the final project is different from your original proposal (based on your stage 1 proposal submission).

We planned to use data from trending videos from multiple countries, however in the current state of the final project, we are only using the data from the US to ensure a speedy user experience and a low-cost GCP environment. In addition to that, we had originally hoped to create a machine learning model with the capability to predict how well a video would trend based on data from similar videos, however due to time constraints, we were unable to implement it.

## 2. Discuss what you think your application achieved or failed to achieve regarding its usefulness.

We believe that our application reached a satisfactory level of utility based on our time constraints. We implemented all of the key functionalities that we had planned. Our web application allows users to search information about various YouTube videos, how those YouTube videos trend, perform CRUD operations on the YouTube video database, see summary statistics regarding YouTube videos, and also find out what tags to use in order to optimize the way that the video can trend. 

In terms of limitations of the application, there are some changes we can perform to the current functionality to increase its usefulness. The web application doesn't allow users to filter on every available field in its current state. Also, the only way for a user to find new tags to use with a new title right now is to insert a new video into the dataset, however, this functionality should also be compatible with an update operation for optimality and greater usefulness. 

## 3. Discuss if you changed the schema or source of the data for your application

The source of data as well as the schema for our application remained generally the same as what had been outlined in our original project proposal.
Although we had planned to eventually use the YouTube video trending data from all of the countries provided in the dataset, we only use data from the US currently. 

## 4. Discuss what you change to your ER diagram and/or your table implementations. What are some differences between the original design and the final design? Why? What do you think is a more suitable design? 

As we had some helpful advice from our mentor Kevin in the regrade stage, there was not much difference between the original design and the final design. Most of the differences, if any, were aesthetic.

## 5. Discuss what functionalities you added or removed. Why?

Some functionalities were added over the course of the project for example, we implemented a feature that added tags to an inserted video if the video didn’t have a tag when the user originally inserted it. We also enabled users to update information about a video after the original insertion. In addition to that, we added a functionality by which insertions from a .csv file are permitted.

A functionality that we removed due to time constraints, was the machine learning model component which would predict how well a new video would trend based on analysis of existing similar videos. Ideally, this model would output the expected number of views, likes, dislikes. We discovered a means to convert an XGBoost model to a SQL query, which would have been able to provide exactly what we wanted with the given variables. However, we did not have enough time to satisfactorily train the model and implement the query.

## 6. Explain how you think your advanced database programs complement your application.
	
A user inserting a video with tag information could prove to be a little tedious based on our database structuring, and it would be incredibly difficult to determine which tags would be optimal to apply to a video and certain title. By implementing a stored procedure and a trigger, we were able to create an environment where the user can easily insert a new video and simultaneously discover which tags would help their video trend, and also reflect this information in our database. 

## 7. Each team member should describe one technical challenge that the team encountered.  This should be sufficiently detailed such that another future team could use this as helpful advice if they were to start a similar project or where to maintain your project. 

Anami - Initially, integrating the database to the front-end in order to create a user interface took a little bit of research and planning since our team had not worked with GCP prior to this project. The utilization of all of the columns in the database was also a little difficult since they had different data formats which complicated the way we would access certain fields. For example, utilizing the description field of a video was a little obscure.

Yuankai - Working with GCP is a challenge we encountered. None of us has related experience before and it took us some time to find out how to switch billing accounts when we ran out of credits. We also spent some time building a good workflow to test our changes on the GCP VM.

Lilly - In part because of GCP complicating our workflow, it was difficult to debug our code. Different environments within GCP would give different, often vague errors for the SQL, and we learned to segment and rearrange parts of our code to identify more specific issues and prioritize the output of the SQL-specific shell. 

Michael - As my teammates have discussed, GCP had a bit of a learning curve. For example, we had a lot of difficulty with our procedure ‘InsertTags’. First off, there was a bit to debug as GCP had some quirks that we were unfamiliar with. Then, after fixing those bugs, we discovered that SQL does not allow writes to any table when another write is being done, and will not allow any writes even if the permissions allow for a dirty read/write. Our trigger updated a value based off of a changed value due to our cursor, so this part was necessary to our project. After speaking with our mentor, Kevin, we were able to come up with a fix wherein we perform the value change in the trigger instead of the cursor.

## 8. Are there other things that changed comparing the final application with the original proposal?

As mentioned previously, we were unable to add the creative machine learning model component due to a restricted amount of time. However, we added functionalities by which tags can be added to an inserted video if it doesn’t have any tags upon initial insertion. We also added a functionality by which insertions from a .csv file are permitted. These are the overall key differences between our final application and the original proposal.

## 9. Describe future work that you think, other than the interface, that the application can improve on.

In terms of future work, we believe adding the functionalities regarding the machine learning part and getting more data using Youtube API when inserting videos would be useful enhancements of the current web application. Additionally, we can further improve the web application by integrating and displaying the data from other countries.

There are also some changes that we can make to optimize the efficiency  of current functionalities. In the current state, our stored procedure will scan over the video titles and find the keyword that is related to the new video title. We have added an index on the video title to make our stored procedure run faster which allows it to take 1 minute to finish for a popular title, however, we would like to keep improving the efficiency.

Currently, we have some quite large tables, for example the Video table contains 17 columns to store all the pertinent information. We think it might improve efficiency if we extract the most commonly used information out to a table and put the other columns in another table. This will allow the tuple size to be smaller when we run the query.

In terms of system optimization, we could add more indexes on the columns to make our top videos/channels return data faster. As of now, we didn't find it necessary to add those indexes, however, if we want to use more complex data like the description of the video, the new indexes will be needed.

Additionally, we have some changes we would like to make to our Update functionality. Currently, the most value to our customers is brought through tag creation with the insert function. However, if a customer wants to change the name of their video and wants to see different possible tags, the only way to do that is through another Insert operation, instead of what should be an Update operation. Thumbnails also take a while to load, and although not necessary to any of the real customer value, they do provide a nice aesthetic, and could possibly be added as data into the table itself instead of the current url implementation.

## 10. Describe the final division of labor and how well you managed teamwork.

Yuankai - I implemented search video and trending records, insertion using .csv file, and three top videos or channels rank. I also did the basic setup of the VM environment and built the suggested workflow. I implemented the two advanced queries and did the analysis about the indexes.

Michael - I created the mockup of the initial web design using Figma, worked on the overall logical database design, and found and used tools to insert tens of thousands of values into the GCP database. Additionally, I implemented the CRUD Update operation. I came up with the idea for the stored procedure, performed research to find which word distance function to use (Levenshtein), debugged the stored procedure code and trigger code, as well as added image functionality.

Anami - I worked on the overall logical database design and the Data Definition Language (DDL) commands used to generate the tables necessary in the database. I also implemented the delete operation (in CRUD) of videos along with specified filter functionalities that would be useful to both content creators and users of YouTube (as listed below).
Most Viewed Videos, Overall Popular Channels, Top Disliked Short Videos, Top Disliked Long Videos, Top Liked Short Videos, Top Videos in Past Year, Trending Categories, Videos with Most Interaction

Lilly - I wrote the initial insert, stored procedure, and trigger code.

As a team, we had meetings when necessary and discussed our tasks/goals and progress/difficulties during or immediately after class time. We used Discord to communicate with each other and discuss the issues we encountered while working. We used whentomeet to schedule group meetings based on availability.
