
-- Users
CREATE TABLE `users` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `password` varchar(256) NOT NULL DEFAULT '',
  `screen_name` varchar(64) NOT NULL DEFAULT '',
  `avatar_url` varchar(256) DEFAULT NULL,
  `created` int(10) unsigned NOT NULL,
  `banned_until` int(10) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `user_tokens` (
  `user_id` int(11) unsigned NOT NULL,
  `token` varchar(40) NOT NULL,
  `type` varchar(16) NOT NULL DEFAULT 'signin',
  `created` int(10) unsigned NOT NULL,
  `expires` int(10) unsigned NOT NULL,
  PRIMARY KEY (`user_id`,`token`),
  UNIQUE KEY `uniq_token` (`token`),
  KEY `k_user_id` (`user_id`),
  KEY `k_expires` (`expires`),
  CONSTRAINT `fk_user_tokens_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tags` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `tag` varchar(64) NOT NULL DEFAULT '',
  `count` int(11) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_tag` (`tag`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `posts` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `author_id` int(11) unsigned NOT NULL,
  `title` varchar(256) NOT NULL DEFAULT '',
  `body` text NOT NULL,
  `slug` varchar(128) NOT NULL DEFAULT '',
  `created` int(10) unsigned NOT NULL,
  `status` tinyint(1) unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_slug` (`slug`),
  KEY `fk_posts_users_author_id` (`author_id`),
  CONSTRAINT `fk_posts_users_author_id` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `posts_tags` (
  `tag_id` int(11) unsigned NOT NULL,
  `post_id` int(11) unsigned NOT NULL,
  PRIMARY KEY (`tag_id`,`post_id`),
  KEY `k_post_id` (`post_id`),
  CONSTRAINT `fk_posts_tags_post_id` FOREIGN KEY (`post_id`) REFERENCES `posts` (`id`),
  CONSTRAINT `fk_posts_tags_tag_id` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;








