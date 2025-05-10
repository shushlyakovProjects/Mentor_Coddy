-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Хост: 127.0.0.1
-- Время создания: Май 10 2025 г., 23:49
-- Версия сервера: 10.4.32-MariaDB
-- Версия PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- База данных: `mentor_coddy`
--

-- --------------------------------------------------------

--
-- Структура таблицы `comments`
--

CREATE TABLE `comments` (
  `CommentId` int(11) NOT NULL,
  `CommentMenteeId` int(11) NOT NULL,
  `CommentDate` tinytext NOT NULL,
  `CommentContent` text NOT NULL,
  `CommentColor` varchar(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `comments`
--

INSERT INTO `comments` (`CommentId`, `CommentMenteeId`, `CommentDate`, `CommentContent`, `CommentColor`) VALUES
(1, 67942, 'Sun May 11 2025 00:18:14 GMT+0300 (Москва, стандартное время)', 'Контрольное сообщение.', '#f6ff75'),
(2, 67934, 'Sun May 11 2025 00:18:10 GMT+0300 (Москва, стандартное время)', 'Продолжает вести индивидуальницу, вечером отпишется', '#f4ff61'),
(3, 71331, 'Sun May 11 2025 00:18:45 GMT+0300 (Москва, стандартное время)', 'Подробности в ВП 12.04', '#efffeb'),
(4, 71738, 'Sun May 11 2025 00:18:52 GMT+0300 (Москва, стандартное время)', 'Слоты проставил', '#ffffff'),
(5, 71936, 'Sun May 11 2025 00:18:56 GMT+0300 (Москва, стандартное время)', 'Планирует с мая нагрузку', '#ffffff');

-- --------------------------------------------------------

--
-- Структура таблицы `feedbacks`
--

CREATE TABLE `feedbacks` (
  `FeedBackID` int(11) NOT NULL,
  `Date` tinytext NOT NULL,
  `FIO` tinytext NOT NULL,
  `Phone` tinytext NOT NULL,
  `CheckInfo` varchar(20) NOT NULL,
  `Comments` text NOT NULL,
  `NewLoad` text NOT NULL,
  `HasConstantUnit` varchar(20) NOT NULL,
  `CountConstantUnits` tinyint(4) NOT NULL,
  `CountPaidModules` tinyint(4) NOT NULL,
  `CountTrialUnits` tinyint(4) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `feedbacks`
--

INSERT INTO `feedbacks` (`FeedBackID`, `Date`, `FIO`, `Phone`, `CheckInfo`, `Comments`, `NewLoad`, `HasConstantUnit`, `CountConstantUnits`, `CountPaidModules`, `CountTrialUnits`) VALUES
(7, 'Tue May 06 2025 23:48:05 GMT+0300 (Москва, стандартное время)', 'Иванов Тест', '89280140532', 'Всё верно', 'отлично', 'Набираю', 'Нет', 0, 0, 1),
(8, 'Tue May 06 2025 23:51:31 GMT+0300 (Москва, стандартное время)', 'Алексеев Тест', '89280140532', 'Всё верно', 'хорошо', 'Нет', 'Да', 4, 5, 0);

-- --------------------------------------------------------

--
-- Структура таблицы `mentees`
--

CREATE TABLE `mentees` (
  `MenteeId` int(11) NOT NULL,
  `LastName` tinytext NOT NULL,
  `FirstName` tinytext NOT NULL,
  `Disciplines` text NOT NULL,
  `CountAllEdUnits` int(11) NOT NULL,
  `CountConstantUnits` int(11) NOT NULL,
  `CountTrialUnitsForWeek` int(11) NOT NULL,
  `CountTrialLessonsForSixMonths` int(11) NOT NULL,
  `LastUpdate` char(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `mentees`
--

INSERT INTO `mentees` (`MenteeId`, `LastName`, `FirstName`, `Disciplines`, `CountAllEdUnits`, `CountConstantUnits`, `CountTrialUnitsForWeek`, `CountTrialLessonsForSixMonths`, `LastUpdate`) VALUES
(62998, 'Аннова', 'Анна', 'Дизайн сайтов,Веб-дизайн с нуля,Создание сайтов на Tilda,Figma - обучение дизайну с основ до PRO', 1, 1, 0, 0, '07-05-2025'),
(67934, 'Полинова', 'Полина', 'Графический дизайн Photoshop,Основы Adobe Illustrator,Digital Art - рисование на планшете,Скетчинг', 1, 1, 0, 0, '07-05-2025');

-- --------------------------------------------------------

--
-- Структура таблицы `summary_monthly`
--

CREATE TABLE `summary_monthly` (
  `SummaryId` int(11) NOT NULL,
  `DateOfUpdate` varchar(10) NOT NULL COMMENT 'Дата записи',
  `CountOfMentee` tinyint(3) UNSIGNED NOT NULL COMMENT 'Количество менти',
  `CountOfMenteeWithConstantUnits` tinyint(3) UNSIGNED NOT NULL COMMENT 'Количество менти с постоянными учениками',
  `CountOfConstantUnits` tinyint(3) UNSIGNED NOT NULL COMMENT 'Всего постоянных учеников',
  `CountOfPaidModules` tinyint(3) UNSIGNED NOT NULL COMMENT 'Всего отправлено модулей на проверку',
  `СountOfNewEdUnits` tinyint(3) UNSIGNED NOT NULL COMMENT 'Новых постоянных учеников',
  `СountOfNewTrials` tinyint(3) UNSIGNED NOT NULL COMMENT 'Проведено пробных занятий'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `summary_monthly`
--

INSERT INTO `summary_monthly` (`SummaryId`, `DateOfUpdate`, `CountOfMentee`, `CountOfMenteeWithConstantUnits`, `CountOfConstantUnits`, `CountOfPaidModules`, `СountOfNewEdUnits`, `СountOfNewTrials`) VALUES
(1, '01-04-2025', 0, 0, 0, 0, 0, 0);

-- --------------------------------------------------------

--
-- Структура таблицы `summary_weekly`
--

CREATE TABLE `summary_weekly` (
  `SummaryId` int(11) NOT NULL,
  `DateOfUpdate` varchar(10) NOT NULL COMMENT 'Дата записи',
  `CountOfMentee` tinyint(3) UNSIGNED NOT NULL COMMENT 'Количество менти',
  `CountOfMenteeWithConstantUnits` tinyint(3) UNSIGNED NOT NULL COMMENT 'Количество менти с постоянными учениками',
  `CountOfConstantUnits` tinyint(3) UNSIGNED NOT NULL COMMENT 'Всего постоянных учеников',
  `CountOfPaidModules` tinyint(3) UNSIGNED NOT NULL COMMENT 'Всего отправлено модулей на проверку',
  `СountOfNewEdUnits` tinyint(3) UNSIGNED NOT NULL COMMENT 'Новых постоянных учеников',
  `СountOfNewTrials` tinyint(3) UNSIGNED NOT NULL COMMENT 'Проведено пробных занятий'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `summary_weekly`
--

INSERT INTO `summary_weekly` (`SummaryId`, `DateOfUpdate`, `CountOfMentee`, `CountOfMenteeWithConstantUnits`, `CountOfConstantUnits`, `CountOfPaidModules`, `СountOfNewEdUnits`, `СountOfNewTrials`) VALUES
(1, '2025-03-01', 29, 9, 26, 0, 0, 2),
(2, '2025-04-01', 29, 9, 26, 0, 0, 2),
(3, '2025-04-20', 29, 9, 26, 0, 0, 2),
(4, '2025-04-29', 29, 9, 26, 0, 0, 2),
(5, '07-05-2025', 28, 11, 22, 0, 0, 10);

-- --------------------------------------------------------

--
-- Структура таблицы `users`
--

CREATE TABLE `users` (
  `UserId` int(11) NOT NULL,
  `Email` tinytext NOT NULL,
  `Password` tinytext NOT NULL,
  `Phone` tinytext NOT NULL,
  `FirstName` tinytext NOT NULL,
  `LastName` tinytext NOT NULL,
  `Role` tinytext NOT NULL DEFAULT '\'base\''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Дамп данных таблицы `users`
--

INSERT INTO `users` (`UserId`, `Email`, `Password`, `Phone`, `FirstName`, `LastName`, `Role`) VALUES
(1, 'amigo7772015@mail.ru', '$2b$05$RALGMB/J8Lj.FoiM4Iv5T.uEXsOVspDnYH1NztQfrkICNbDlOyL3.', '9280140532', 'Никита', 'Шушляков', 'admin'),
(5, 'test@mail.ru', '$2b$05$Bi3V5ZZxtn/vp0GPnPsYXOhbmKXu8QoKa2aUJkfvv0Rv1nRKKTNX.', '89998887767', 'Иван', 'Иванов', 'mentor'),
(11, 'read@mail.ru', '$2b$05$2Uhk.snB3NEJf6ET4YwmQ.pfj8aT0orYW5JCT8Nz2Ul/tX2QQDHBy', '+79998883344', 'Дмитрий', 'Дмитрев', 'reader');

--
-- Индексы сохранённых таблиц
--

--
-- Индексы таблицы `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`CommentId`);

--
-- Индексы таблицы `feedbacks`
--
ALTER TABLE `feedbacks`
  ADD PRIMARY KEY (`FeedBackID`);

--
-- Индексы таблицы `mentees`
--
ALTER TABLE `mentees`
  ADD PRIMARY KEY (`MenteeId`);

--
-- Индексы таблицы `summary_monthly`
--
ALTER TABLE `summary_monthly`
  ADD PRIMARY KEY (`SummaryId`),
  ADD UNIQUE KEY `DateOfUpdate` (`DateOfUpdate`);

--
-- Индексы таблицы `summary_weekly`
--
ALTER TABLE `summary_weekly`
  ADD PRIMARY KEY (`SummaryId`),
  ADD UNIQUE KEY `DateOfUpdate` (`DateOfUpdate`);

--
-- Индексы таблицы `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`UserId`),
  ADD UNIQUE KEY `Email` (`Email`) USING HASH;

--
-- AUTO_INCREMENT для сохранённых таблиц
--

--
-- AUTO_INCREMENT для таблицы `comments`
--
ALTER TABLE `comments`
  MODIFY `CommentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT для таблицы `feedbacks`
--
ALTER TABLE `feedbacks`
  MODIFY `FeedBackID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT для таблицы `summary_monthly`
--
ALTER TABLE `summary_monthly`
  MODIFY `SummaryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT для таблицы `summary_weekly`
--
ALTER TABLE `summary_weekly`
  MODIFY `SummaryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT для таблицы `users`
--
ALTER TABLE `users`
  MODIFY `UserId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
