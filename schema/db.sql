
-- Users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `password` varchar(16) NOT NULL,
  `screen_name` varchar(64) NOT NULL DEFAULT '',
  `created` int(10) UNSIGNED NOT NULL, 
  `banned_until` int(10) UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY  (`id`),
  UNIQUE KEY `uniq_email` (`email`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

CREATE TABLE `user_tokens` (
  `user_id` int(11) unsigned NOT NULL,
  `token` varchar(40) NOT NULL,
  `created` int(10) unsigned NOT NULL,
  `expires` int(10) unsigned NOT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `uniq_token` (`token`),
  KEY `k_user_id` (`user_id`),
  CONSTRAINT `fk_user_tokens_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

