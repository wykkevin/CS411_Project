import csv

# country_list = {'BR', 'CA', 'DE', 'FR', 'GB', 'IN', 'JP', 'KR', 'MX', 'RU', 'US'}
country_list = {'US'}

tag_set = set()
# f_tag = open('insert_tags.sql', 'w')
# f_tag.write("USE youtubeTrendingData;\n")
# f_tag.write("INSERT INTO Tag(tagName) values\n")

f_video_tag = open('insert_video_tags.sql', 'w')
f_video_tag.write("USE youtubeTrendingData;\n")
f_video_tag.write("INSERT INTO VideoTag(videoId, tagName) values\n")

f_video_tag_count = 0

video_set = set()

for country in country_list:
    results_channel = open(country + '_channel.csv', 'w')
    results_video = open(country + '_video.csv', 'w')
    writer_channel = csv.writer(results_channel)
    writer_video = csv.writer(results_video)

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
                if video_id not in video_set:
                    video_set.add(video_id)
                    tag = row[7]
                    tags = tag.split("|")
                    video_tag_set = set()
                    for tag in tags:
                        if tag != "[None]" and tag != "":
                            cleaned_tag = tag.replace("/", "").replace("\\", "").lower()
                            if cleaned_tag.isascii():
                                tag_set.add(cleaned_tag)
                                video_tag_set.add(cleaned_tag)
                    for tag in video_tag_set:
                        f_video_tag.write("(\"" + video_id + "\", \"" + tag + "\"),\n")
                line_count += 1

        # for tag in tag_set:
        #     f_tag.write("(\"" + tag + "\"),\n")
# Manually change the last "," to ";"
