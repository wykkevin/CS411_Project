DROP PROCEDURE InsertTags;
DELIMITER //
CREATE PROCEDURE InsertTags (IN id VARCHAR(255), IN titleInput VARCHAR(255), OUT newTagCount INT)
BEGIN
	
	DECLARE tagsAdded int default 0;
	DECLARE done int default 0;
	DECLARE tag VARCHAR(255);
	DECLARE tagCursor CURSOR FOR (SELECT tagName FROM VideoTag NATURAL JOIN (SELECT DISTINCT videoId FROM Video NATURAL JOIN Trending WHERE likes > 100000 AND like_ratio > 0.9 AND comment_count > 10000 AND levenshtein(titleInput, title) < 10) AS popularVideos GROUP BY tagName HAVING count(tagName) > 5);
	DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;
	OPEN tagCursor;
	REPEAT
		FETCH tagCursor INTO tag;
		IF NOT done THEN
			INSERT INTO VideoTag VALUES(id, tag);
			SET tagsAdded = tagsAdded + 1;
		END IF;
	UNTIL done END REPEAT;
	close tagCursor;
	SELECT tagsAdded INTO newTagCount;
END //
DELIMITER ;
