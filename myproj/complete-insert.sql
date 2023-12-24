DROP PROCEDURE CompleteInsert;
DELIMITER //
CREATE PROCEDURE CompleteInsert (IN channelIdParam VARCHAR(255), IN channelTitle VARCHAR(255), IN videoIdParam VARCHAR(255), IN title VARCHAR(255))
BEGIN
	IF NOT EXISTS (SELECT channelId FROM Channel WHERE channelId = channelIdParam) THEN
        -- If it doesn't exist, add it to the Channel table
        INSERT INTO Channel(channelId, channelTitle) VALUES (channelIdParam, channelTitle);
    END IF;
    IF NOT EXISTS (SELECT videoId FROM Video WHERE videoId = videoIdParam) THEN
        -- If it doesn't exist, add it to the Video table
        INSERT INTO Video VALUES(videoIdParam, channelIdParam, 1, title, '2023-01-01', '00:00:00', 'google.com', FALSE, FALSE, 'Placeholder description', 1, 'English', 'English', '0', 0);
    END IF;
    IF NOT EXISTS (SELECT videoId FROM Trending WHERE videoId = videoIdParam and date = '2023-01-02') THEN
    	INSERT INTO Trending VALUES('2023-01-02', videoIdParam, 100000, 10000, 0, 1, 1000, 0, 'US');
    END IF;
END //
DELIMITER ;
