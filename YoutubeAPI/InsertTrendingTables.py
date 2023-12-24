import csv
from dateutil import parser

# country_list = {'BR', 'CA', 'DE', 'FR', 'GB', 'IN', 'JP', 'KR', 'MX', 'RU', 'US'}
country_list = {'US'}

date_set = set()
video_date_set = set()
f_date = open('insert_trending_date.sql', 'w')
f_date.write("USE youtubeTrendingData;\n")
f_date.write("INSERT INTO TrendingDate(date) values\n")

f_trending = open('insert_trending.sql', 'w')
f_trending.write("USE youtubeTrendingData;\n")
f_trending.write(
    "INSERT INTO Trending(date, videoId, view_count, likes, dislikes, like_ratio, comment_count, engagement_rate, country) values\n")

for country in country_list:
    # fi = open('../archive/' + country + '_youtube_trending_data.csv', 'rb')
    # data = fi.read()
    # fi.close()
    # fo = open('../archive/' + country + '_youtube_trending_data_new.csv', 'wb')
    # fo.write(data.replace(b'\x00', b''))
    # fo.close()

    with open('../archive/' + country + '_youtube_trending_data_new.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count <= 0:
                line_count += 1
            else:
                video_id = row[0]
                trending_date = row[6]
                view_count = row[8]
                likes = row[9]
                dislikes = row[10]
                comment_count = row[11]
                like_or_dislike = (float(likes) + float(dislikes))
                if like_or_dislike == 0:
                    like_ratio = "null"
                else:
                    like_ratio = "\"" + str(round(float(likes) / like_or_dislike, 3)) + "\""

                parsed_date = str(parser.parse(trending_date).date())

                video_date = video_id + trending_date
                if video_date not in video_date_set:
                    video_date_set.add(video_date)
                    f_trending.write(
                        "(\"" + parsed_date + "\"," + "\"" + video_id + "\"," + view_count + "," + likes + "," + dislikes + "," + like_ratio + "," + comment_count + "," + "null" + ",\"" + country + "\"),\n")

                if parsed_date not in date_set:
                    date_set.add(parsed_date)
                    f_date.write("(\"" + parsed_date + "\"),\n")
                line_count += 1

# Manually change the last "," to ";"
