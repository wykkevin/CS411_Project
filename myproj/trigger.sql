DROP TRIGGER InsertTrig;
DELIMITER //
CREATE TRIGGER InsertTrig
		BEFORE INSERT ON Video
		FOR EACH ROW
	BEGIN
		IF new.numberOfTags = 0 THEN
			CALL InsertTags(new.videoId, new.title, @total);
			SET new.numberOfTags = @total;
		END IF;
	END //
DELIMITER ;
