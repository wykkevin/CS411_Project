import googleapiclient.discovery
import csv
import isodate

# The plan is to get video language, category description, channel subscriber and member (sponsor), country youtube user
# apikey = 'AIzaSyASuWspW7QrHZCKfgvLjRGfVak_30n29FM' # From 411 project
apikey = 'AIzaSyAU2eYkCm7BXESI2LtH1PAEEd6CNU_smgc' # From youtube-api2
# country_list = {'BR', 'CA', 'DE', 'FR', 'GB', 'IN', 'JP', 'KR', 'MX', 'RU', 'US'}
country_list = {'US'}
# API information
api_service_name = "youtube"
api_version = "v3"

# API client
youtube = googleapiclient.discovery.build(api_service_name, api_version, developerKey=apikey)

header = ['channelId', 'channelViewCount', 'subscriberCount', 'hiddenSubscriberCount', 'videoCount', 'videoId',
          'defaultLanguage', 'defaultAudioLanguage', 'duration(H/M/S)', 'duration(seconds)']

for country in country_list:
    results = open(country + '_additional_info.csv', 'w')
    writer = csv.writer(results)
    writer.writerow(header)

    with open('../archive/' + country + '_youtube_trending_data.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count > 2000:
                break
            if line_count <= 1000:
                line_count += 1
            else:
                data = []
                # print('video_id ' + row[0] + ' channelId ' + row[3] + ' categoryId ' + row[5])
                line_count += 1

                channelId = row[3]
                videoId = row[0]

                data.append(channelId)
                r_channel = youtube.channels().list(
                    part='statistics',
                    id=channelId,
                    # fields='items(statistics(viewCount,subscriberCount,hiddenSubscriberCount,videoCount))'
                ).execute()
                r_channel_items = r_channel.get('items')
                if r_channel_items is not None and len(r_channel_items) >= 1:
                    channel_statistics = r_channel_items[0]['statistics']
                    data.append(channel_statistics['viewCount'])
                    data.append(channel_statistics['subscriberCount'])
                    data.append(channel_statistics['hiddenSubscriberCount'])
                    data.append(channel_statistics['videoCount'])
                else:
                    data.append("null")
                    data.append("null")
                    data.append("null")
                    data.append("null")

                # defaultLanguage,defaultAudioLanguage are optional fields
                # Maybe useful: contentDetails.duration, statistics.favoriteCount
                data.append(videoId)
                r_video_result = youtube.videos().list(
                    part='snippet, contentDetails',
                    id=videoId,
                    # fields='snippet(defaultLanguage,defaultAudioLanguage)'
                ).execute()
                r_video_items = r_video_result['items']
                if r_video_items is not None and len(r_video_items) >= 1:
                    video_snippet = r_video_items[0].get('snippet')
                    defaultLanguage = video_snippet.get('defaultLanguage')
                    if defaultLanguage is None:
                        data.append("null")
                    else:
                        data.append(defaultLanguage)
                    defaultAudioLanguage = video_snippet.get('defaultAudioLanguage')
                    if defaultAudioLanguage is None:
                        data.append("null")
                    else:
                        data.append(defaultAudioLanguage)

                    video_contentDetails = r_video_items[0]['contentDetails']
                    duration = video_contentDetails['duration']
                    data.append(duration)
                    dur_in_seconds = isodate.parse_duration(duration)
                    data.append(dur_in_seconds.total_seconds())
                else:
                    data.append("null")
                    data.append("null")
                    data.append("null")
                    data.append("null")

                writer.writerow(data)

    results.close()
