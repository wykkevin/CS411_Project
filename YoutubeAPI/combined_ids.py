import googleapiclient.discovery
import csv
import isodate

# The plan is to get video language, category description, channel subscriber and member (sponsor), country youtube user
# apikey = 'AIzaSyASuWspW7QrHZCKfgvLjRGfVak_30n29FM' # From 411 project
apikey = 'AIzaSyAU2eYkCm7BXESI2LtH1PAEEd6CNU_smgc'  # From youtube-api2
# country_list = {'BR', 'CA', 'DE', 'FR', 'GB', 'IN', 'JP', 'KR', 'MX', 'RU', 'US'}
country_list = {'US'}
# API information
api_service_name = "youtube"
api_version = "v3"

# API client
youtube = googleapiclient.discovery.build(api_service_name, api_version, developerKey=apikey)

channel_header = ['channelId', 'channelViewCount', 'subscribersCount', 'hiddenSubscriberCount', 'videoCount']
video_header = ['videoId', 'defaultLanguage', 'defaultAudioLanguage', 'duration(H/M/S)', 'duration(seconds)']

video_ids = set()
channel_ids = set()

for country in country_list:
    results_channel = open(country + '_channel.csv', 'w')
    results_video = open(country + '_video.csv', 'w')
    writer_channel = csv.writer(results_channel)
    writer_video = csv.writer(results_video)
    writer_channel.writerow(channel_header)
    writer_video.writerow(video_header)

    fi = open('../archive/' + country + '_youtube_trending_data.csv', 'rb')
    data = fi.read()
    fi.close()
    fo = open('../archive/' + country + '_youtube_trending_data_new.csv', 'wb')
    fo.write(data.replace(b'\x00', b''))
    fo.close()

    with open('../archive/' + country + '_youtube_trending_data_new.csv') as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        line_count = 0
        for row in csv_reader:
            if line_count <= 0:
                line_count += 1
            else:
                if row[0] is not None:
                    video_ids.add(row[0])
                if row[3] is not None:
                    channel_ids.add(row[3])
                line_count += 1

    print('total channel ' + str(len(channel_ids)))
    print('total videos ' + str(len(video_ids)))
    channel_string_list = []
    count = 0
    channel_id_string = "\""
    for id in channel_ids:
        count += 1
        channel_id_string += id + ","
        if count == 50:
            count = 0
            channel_id_string = channel_id_string[:-1] + "\""
            channel_string_list.append(channel_id_string)
            channel_id_string = "\""
    channel_id_string = channel_id_string[:-1] + "\""
    channel_string_list.append(channel_id_string)
    # print(channel_id_string)

    video_string_list = []
    count = 0
    video_id_string = "\""
    for id in video_ids:
        count += 1
        video_id_string += id + ","
        if count == 50:
            count = 0
            video_id_string = video_id_string[:-1] + "\""
            video_string_list.append(video_id_string)
            video_id_string = "\""
    video_id_string = video_id_string[:-1] + "\""
    video_string_list.append(video_id_string)
    # print(video_id_string)

    for ids in channel_string_list:
        r_channel = youtube.channels().list(
            part='statistics',
            id=ids  # limit is 50 ids
        ).execute()
        r_channel_items = r_channel.get('items')
        for channel_result in r_channel_items:
            channel_csv_data = []
            channel_stats = channel_result['statistics']
            channel_csv_data.append(channel_result['id'])
            viewCount = channel_stats.get('viewCount')
            if viewCount is None:
                channel_csv_data.append("null")
            else:
                channel_csv_data.append(viewCount)
            subscriberCount = channel_stats.get('subscriberCount')
            if subscriberCount is None:
                channel_csv_data.append("null")
            else:
                channel_csv_data.append(subscriberCount)
            hiddenSubscriberCount = channel_stats.get('hiddenSubscriberCount')
            if hiddenSubscriberCount is None:
                channel_csv_data.append("null")
            else:
                channel_csv_data.append(hiddenSubscriberCount)
            videoCount = channel_stats.get('videoCount')
            if videoCount is None:
                channel_csv_data.append("null")
            else:
                channel_csv_data.append(videoCount)
            writer_channel.writerow(channel_csv_data)

    for ids in video_string_list:
        r_video_result = youtube.videos().list(
            part='snippet, contentDetails',
            id=ids,
        ).execute()
        r_video_items = r_video_result.get('items')
        for video_result in r_video_items:
            video_csv_data = [video_result['id']]
            video_snippet = video_result.get('snippet')
            defaultLanguage = video_snippet.get('defaultLanguage')
            if defaultLanguage is None:
                video_csv_data.append("null")
            else:
                video_csv_data.append(defaultLanguage)
            defaultAudioLanguage = video_snippet.get('defaultAudioLanguage')
            if defaultAudioLanguage is None:
                video_csv_data.append("null")
            else:
                video_csv_data.append(defaultAudioLanguage)

            video_contentDetails = video_result['contentDetails']
            duration = video_contentDetails['duration']
            video_csv_data.append(duration)
            dur_in_seconds = isodate.parse_duration(duration)
            video_csv_data.append(dur_in_seconds.total_seconds())

            writer_video.writerow(video_csv_data)
