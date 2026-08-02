import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { calculateListeningBand, formatSeconds } from '../lib/scoring'
import { saveTestResult } from '../lib/supabase'

// 1:1 legacy css
const legacyCss = `

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            background-color: #ffffff;
            line-height: 1.4;
            font-size: 16px;
            padding-bottom: 90px; /* nav-row height (80px) + some extra spacing */
        }

        /* Page watermark */
        body::after {
            content: "@MINDLESS_WRITER";
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%) rotate(-20deg);
            font-size: 72px;
            font-weight: 800;
            letter-spacing: 2px;
            color: #000000;
            opacity: 0.02; /* subtle */
            pointer-events: none;
            z-index: 0;
            white-space: nowrap;
        }

        .header {
            background-color: #ffffff;
            padding: 12px 20px;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            height: 60px;
        }

        .ielts-logo {
            display: none;
        }

        .test-info {
            display: flex;
            align-items: center;
            gap: 30px;
            font-size: 14px;
            color: #333;
        }

        .audio-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 16px;
        }

        .audio-icon {
            width: 16px;
            height: 16px;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon></svg>') no-repeat center;
        }

        .header-icons {
            display: flex;
            gap: 10px;
            align-items: center;
        }

        .telegram-link {
            color: #3e3e3e;
            text-decoration: none;
            font-weight: 700;
            font-size: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            border: 2px solid #3e3e3e;
            border-radius: 9999px;
            background-color: #ffffff;
            line-height: 1;
        }

        .telegram-link:hover {
            background-color: #f6f6f6;
        }

        .telegram-link::before {
            content: '';
            display: inline-block;
            width: 20px;
            height: 20px;
            background-color: currentColor;
            -webkit-mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-1.37.2-1.64l16.56-6.4c.75-.29 1.4.22 1.2.94l-2.67 12.61c-.22.95-1.13 1.18-1.78.73l-4.5-3.32l-2.23 2.15c-.47.44-1.29.21-1.48-.37z"/></svg>');
            mask-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-1.37.2-1.64l16.56-6.4c.75-.29 1.4.22 1.2.94l-2.67 12.61c-.22.95-1.13 1.18-1.78.73l-4.5-3.32l-2.23 2.15c-.47.44-1.29.21-1.48-.37z"/></svg>');
            background-size: contain;
            background-repeat: no-repeat;
        }

        #volume-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 80px;
            height: 4px;
            background: #ddd;
            outline: none;
            border-radius: 2px;
            cursor: pointer;
        }

        #volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #333;
            cursor: pointer;
        }

        #volume-slider::-moz-range-thumb {
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #333;
            cursor: pointer;
            border: none;
        }

        .icon {
            width: 20px;
            height: 20px;
            cursor: pointer;
            opacity: 0.7;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .icon:hover {
            opacity: 1;
        }
        
        #play-pause-btn {
            background: none;
            border: none;
            padding: 0;
        }

        .main-container {
            margin-top: 60px;
            display: flex;
            background: #ffffff;
            padding-bottom: 100px; /* Space for bottom nav */
        }

        .main-container.results-mode {
            display: flex;
            flex-direction: row;
        }

        /* Left Panel */
        .left-panel {
            width: 100%;
            padding: 20px;
            transition: width 0.4s ease;
        }

        .main-container.results-mode .left-panel {
            width: 75%;
            overflow-y: auto;
            height: calc(100vh - 195px);
        }

        /* Right Panel */
        .right-panel {
            display: none;
            width: 50%;
            padding: 20px;
            position: relative;
            border-left: 1px solid #e0e0e0;
            overflow-y: auto;
            height: calc(100vh - 195px);
        }

        #transcription-container h2 {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
        }

        #transcription-text {
            white-space: pre-wrap; /* preserve line breaks from source */
            font-family: inherit;
            font-size: 15px;
            line-height: 1.7;
        }
        
        .transcription-instruction {
            display: block;
            margin: 1em 0;
            font-style: italic;
            color: #444;
        }

        .main-container.results-mode .right-panel {
            display: block;
            width: 25%;
            border-left: 1px solid #e0e0e0;
            border-top: none;
            height: calc(100vh - 195px);
            overflow-y: auto;
        }

        .help-button {
            background: #4a90e2;
            color: white;
            border: none;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 14px;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 5px;
            margin-bottom: 20px;
        }

        /* Inline correct answer hint (shown after checking) */
        .correct-inline {
            color: #28a745;
            font-weight: 700;
            margin-left: 10px;
            display: inline-block;
            vertical-align: middle;
            white-space: nowrap;
        }
        .correct-inline::before {
            content: "\\2192  "; /* right arrow */
            font-weight: 700;
        }

        .help-button:hover {
            background: #357abd;
        }

        .section-title {
            font-weight: bold;
            margin-bottom: 15px;
            font-size: 18px;
        }

        .people-section {
            margin-bottom: 30px;
        }

        .people-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #ccc;
        }

        .people-table th {
            text-align: left;
            padding: 10px;
            font-weight: bold;
            border: 1px solid #ddd;
        }

        .people-table td {
            padding: 8px 10px;
            border: 1px solid #ddd;
        }
        #part-4 .questions-container {
            width: 80%;
        }

        /* Matching cell styling */
        .matching-cell {
            transition: all 0.2s ease;
        }
        
        .matching-cell:hover {
            background-color: #e3f2fd !important;
            transform: scale(1.02);
        }
        
        .matching-cell.selected {
            background-color: #4a90e2 !important;
            color: white !important;
            font-weight: bold;
        }

        #part-1 table td {
            line-height: 1.8;
        }
        /* Increase line height for tables in Part 4 */
        #part-4 table td {
            line-height: 2.0;
            padding-top: 10px;
            padding-bottom: 10px;
        }
        #part-4 table td div { margin: 8px 0; }
        /* Increase line height for Part 3 table (Questions 24-30) */
        #part-3 table td {
            line-height: 2.0;
            padding-top: 10px;
            padding-bottom: 10px;
            vertical-align: top;
        }
        /* Geosequestration table styling */
        .geo-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        .geo-table th, .geo-table td { border: 1px solid #e5e7eb; padding: 14px; vertical-align: top; }
        .geo-table thead th { background: #f7f9fc; text-align: center; font-weight: 700; }
        .geo-table .arrow-row td { text-align: center; font-size: 20px; color: #6b7280; }

        .person-name {
            font-size: 16px;
        }

        .question-number {
            background: white;
            border: 1px solid #4a90e2;
            padding: 4px 8px;
            border-radius: 3px;
            font-weight: bold;
            font-size: 14px;
            color: #4a90e2;
            min-width: 30px;
            text-align: center;
        }

        .assigned-responsibility {
            background: #f0f0f0;
            padding: 4px 8px;
            border-radius: 3px;
            font-size: 14px;
            border: 1px solid #ddd;
        }

        .responsibilities-section {
            margin-bottom: 30px;
        }

        .responsibility-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
            margin-bottom: 20px;
        }

        .responsibility-item {
            background: #f8f9fa;
            border: 1px solid #ddd;
            padding: 8px 12px;
            border-radius: 4px;
            cursor: move;
            font-size: 16px;
            text-align: center;
            transition: all 0.2s;
        }

        .responsibility-item:hover {
            background: #e9ecef;
            transform: translateY(-1px);
        }

        .responsibility-item.dragging {
            opacity: 0.5;
            transform: rotate(2deg);
        }

        .questions-section {
            margin-bottom: 20px;
        }

        .question-title {
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 16px;
        }

        .instruction {
            margin-bottom: 20px;
            font-size: 16px;
            color: #666;
        }

        .centered-title {
            text-align: center;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 15px;
        }

        /* Map Styles */
        .map-container {
            position: relative;
            margin: 20px auto;
            width: 100%;
            max-width: 600px;
            /* display: block; */
            /* display: flex; */
        }
        .map-container img {
            width: 100%;
            display: block;
        }
        .map-drop-zone {
            position: absolute;
            width: 13%;
            height: 15%;
            border: 2px dashed #999;
            background-color: rgba(255, 255, 255, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            color: #555;
            border-radius: 4px;
            padding: 2px;
        }
        .map-drop-zone:hover {
            background-color: rgba(230, 244, 255, 0.7);
            border-color: #4a90e2;
        }
        .map-drop-zone .drag-item {
            font-size: 14px;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px;
        }
        .map-options-list {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            justify-content: center;
            margin-top: 20px;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .map-options-list .drag-item {
            width: calc(25% - 10px);
            text-align: center;
        }

        /* Navigation Arrows */
        .nav-arrows {
            position: fixed;
            bottom: 100px;
            right: 20px;
            display: flex;
            gap: 5px;
            z-index: 101;
        }

        .nav-arrow {
            width: 50px;
            height: 50px;
            background: #333;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 22px;
            font-weight: bold;
        }

        .nav-arrow:hover {
            background: #555;
        }

        .nav-arrow:disabled {
            background: #ccc;
            cursor: not-allowed;
        }

        /* Bottom Navigation - Exact Match */
        .nav-row {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #ffffff;
        
            padding: 0;
            display: flex;
            align-items: center;
            height: 80px;
            z-index: 100;

            /* Allow horizontal scrolling on smaller screens */
            overflow-x: auto;
            overflow-y: hidden;
            white-space: nowrap;
            -webkit-overflow-scrolling: touch;
        }

        /* Prevent "Score/Band" button text overflow on small screens */
        .footer__deliverButton___3FM07 {
            max-width: 42%;
            white-space: normal;          /* allow wrapping */
            word-break: break-word;       /* break long text if needed */
            line-height: 1.2;
        }
        @media (max-width: 768px) {
            .footer__deliverButton___3FM07 {
                max-width: 55%;
                padding: 10px 12px;
                font-size: 14px;
            }
        }
        @media (max-width: 480px) {
            .footer__deliverButton___3FM07 {
                max-width: 65%;
                padding: 8px 10px;
                font-size: 13px;
            }
        }

        .footer__questionWrapper___1tZ46 {
            display: flex;
            align-items: center;
            margin-right: 20px;
            flex-shrink: 0;
        }


        .footer__questionNo___3WNct {
            background: none;
            border: none;
            padding: 10px 15px;
            font-size: 16px;
            font-weight: 600;
            color: #333;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: background-color 0.2s;
        }

        .footer__questionNo___3WNct:hover {
            background-color: #f8f9fa;
        }

        .section-prefix {
            font-size: 16px;
        }

        .sectionNr {
            font-size: 16px;
            font-weight: bold;
        }

        .attemptedCount {
            font-size: 14px;
            color: #666;
            margin-left: 5px;
            font-weight: 400; /* Normal weight */
        }

        @media (max-width: 1024px) {
            .attemptedCount {
                display: none;
            }
        }

        .footer__questionWrapper___1tZ46.selected .attemptedCount {
            display: none;
        }

        .footer__subquestionWrapper___9GgoP {
            display: none;
            gap: 2px;
            margin-left: 10px;
        }

        .footer__questionWrapper___1tZ46.selected .footer__subquestionWrapper___9GgoP {
            display: flex;
        }

        .subQuestion {
            width: 32px;
            height: 32px;
            border: 1px solid #ccc;
            background: white;
            color: #333;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            border-radius: 2px;
        }

        .subQuestion.answered {
            background-color: #e9ecef;
            border-color: #ddd;
        }
        .subQuestion.correct {
            background-color: #28a745;
            color: white;
            border-color: #28a745;
        }
        .subQuestion.incorrect {
            background-color: #dc3545;
            color: white;
            border-color: #dc3545;
        }

        .subQuestion:hover {
            background-color: #f0f0f0;
            border-color: #999;
        }

        .subQuestion.active {
            background-color: #4a90e2;
            color: white;
            border-color: #4a90e2;
        }

        .subQuestion.completed {
            background-color: #28a745;
            color: white;
            border-color: #28a745;
        }

        /* Clickable cell styles for Questions 26-30 */
        .clickable-cell {
            transition: all 0.2s ease;
        }

        .clickable-cell:hover {
            background-color: #e9ecef !important;
        }

        .clickable-cell.selected {
            background-color: #4a90e2 !important;
            color: white !important;
        }

        .clickable-cell.correct {
            background-color: #28a745 !important;
            color: white !important;
        }

        .clickable-cell.incorrect {
            background-color: #dc3545 !important;
            color: white !important;
        }

        .sr-only {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }

        .footer__deliverButton___3FM07 {
            margin-left: auto;
            margin-right: 20px;
            background-color: #f0f0f0;
            color: #333;
            border: 1px solid #ccc;
            padding: 12px 20px;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.2s, border-color 0.2s;
            min-width: 170px;
            justify-content: center;
        }

        .footer__deliverButton___3FM07:hover {
            background-color: #e0e0e0;
            border-color: #bbb;
        }
        /* Success style for "My Results" button after checking */
        .footer__deliverButton___3FM07.success {
            background-color: #28a745;
            color: #fff;
            border-color: #28a745;
        }
        .footer__deliverButton___3FM07.success:hover {
            background-color: #218838;
            border-color: #1e7e34;
        }

        .footer__deliverButton___3FM07:disabled {
            background: #e9ecef;
            color: #6c757d;
            cursor: not-allowed;
            border-color: #ddd;
        }

        .fa-check::before {
            content: "✓";
        }

        .hidden {
            display: none;
        }

        /* Context Menu */
        .context-menu {
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1000;
            display: none;
            min-width: 140px;
        }

        .context-menu-item {
            padding: 12px 16px;
            cursor: pointer;
            font-size: 16px;
            border-bottom: 1px solid #f0f0f0;
            transition: background-color 0.2s;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .context-menu-item:hover {
            background-color: #f8f9fa;
        }

        .context-menu-item:last-child {
            border-bottom: none;
        }

        .highlight {
            background-color: #ffff00;
        }

        .comment-highlight {
            background-color: #90EE90;
            position: relative;
            cursor: help;
        }

        .comment-tooltip {
            position: absolute;
            bottom: 100%;
            left: 50%;
            transform: translateX(-50%);
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            white-space: nowrap;
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.3s;
        }

        .comment-highlight:hover .comment-tooltip {
            opacity: 1;
        }

        .question {
            margin-bottom: 40px;
        }
        .question p {
            margin-bottom: 10px;
        }
        .question ul, .question .people-table {
            margin-top: 0;
        }
        .question-prompt {
            margin-bottom: 20px;
        }
        .question ul {
            list-style: none;
            padding-left: 0;
        }
        .question ul li {
            margin-bottom: 5px;
        }
        .answer-input {
            border: 1px solid #9aa3ad;
            border-radius: 4px;
            background-color: #fff;
            padding: 4px 8px;
            font-size: 16px;
            text-align: left; /* start typing from left */
            margin-right: 4px;
            width: 140px;
            max-width: 160px;
            min-width: 120px;
            word-break: break-word;
            overflow-wrap: break-word;
            white-space: normal;
            height: 28px;
            min-height: 28px;
            line-height: 1.2;
            vertical-align: middle;
            transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .answer-input::placeholder {
            color: #999;
            font-weight: bold;
            text-align: center; /* numbers centered until typing starts */
        }
        .answer-input:focus {
            outline: none;
            border-color: #2c6bed;
            border-width: 2px;
        }
        .answer-input.correct {
            border-color: #28a745;
            background-color: #e9f7ef;
        }
        .answer-input.incorrect {
            border-color: #dc3545;
            background-color: #f8d7da;
            color: #721c24;
        }
        .answer-input {
    z-index: 10;
    position: relative;
    pointer-events: auto;
    font-weight: 600;
}
        .drag-drop-container {
            display: flex;
            gap: 30px;
            margin-top: 20px;
            align-items: flex-start;
        }
        .recommendations-box {
            display: flex;
            flex-direction: column;
            gap: 8px;
            padding: 10px;
            min-height: 200px;
        }
        .drag-item {
            background: white;
    border: 1px solid #9c9c9c;
    font-weight: 600;
    padding: 0px 5px;
            border-radius: 4px;
            cursor: move;
            font-size: 16px;
            transition: all 0.2s;
            user-select: none;
        }
        .drag-item:hover {
            background: #e9ecef;
        }
        .drag-item.dragging {
            opacity: 0.5;
            transform: rotate(2deg);
        }
        .drop-zone {
            border: 2px dashed #aaa;
            border-radius: 4px;
            height: 25px;
            margin-top: 19px;
            margin-bottom: 5px;
            transition: background-color 0.2s, border-color 0.2s;
            padding: 0.5px 5px;
            display: flex;
            align-items: center;
            position: relative;
            color: #b3b3b3;
            font-weight: 600;
            min-width: 200px;
            width: auto;
        }
        .drop-zone.drag-over {
            background-color: #e6f4ff;
            border-color: #4a90e2;
        }
        /* Letter pill displayed inside drop-zones */
        .drop-letter {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 22px;
            height: 20px;
            padding: 0 6px;
            border: 1px solid #4a90e2;
            color: #0f5bd7;
            background: #eef5ff;
            border-radius: 9999px;
            font-weight: 700;
            cursor: move;
            user-select: none;
        }
        .drop-zone.correct {
            background-color: #e9f7ef;
            border-color: #28a745;
            border-style: solid;
        }
        .drop-zone.incorrect {
            background-color: #f8d7da;
            border-color: #dc3545;
            border-style: solid;
        }
        .drop-zone .drag-item {
            cursor: default;
        }
        .drag-item.selected {
            border-color: #4a90e2;
            box-shadow: 0 0 0 1px #4a90e2;
        }
        .questions-container {
            width: 50%;
        }
        /* When transcription (results mode) is visible, give questions container 80% of left panel */
        .main-container.results-mode .questions-container {
            width: 80%;
        }
        audio {
            width: 100%;
            margin-bottom: 20px;
        }
        .part-header {
            background-color: #f1f2ec;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
            border: 1px solid #e0e0e0;
        }
        .part-header p {
            margin: 0;
        }

        .question li.correct {
            color: #155724;
            font-weight: bold;
        }
        .question li.incorrect {
            color: #721c24;
        }
        .question li.correct::before {
            content: '✔ ';
            color: #28a745;
        }
        .question li.incorrect::before {
            content: '✖ ';
            color: #dc3545;
        }

        .example-box {
            margin: 20px 0;
        }

        .timer-container {
            display: none; /* Timer hidden */
            color: #333;
            font-size: 16px;
            font-weight: 500;
        }
        .timer-container .timer-tooltip {
            display: none;
        }

        .audio-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(40, 40, 40, 0.9);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            text-align: center;
        }
        .audio-modal-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 20px;
            max-width: 500px;
            padding: 20px;
        }
        .audio-modal-content p {
            font-size: 16px;
            line-height: 1.5;
            color: #eee;
        }
        .audio-modal-icon {
            margin-bottom: 20px;
        }
        .modal-play-btn {
            background-color: #000;
            color: white;
            border: 1px solid white;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: background-color 0.2s;
        }
        .modal-play-btn:hover {
            background-color: #333;
        }
        #goto-widget {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        #goto-input {
            width: 80px;
            padding: 4px 8px;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        #goto-btn {
            padding: 4px 10px;
            border: 1px solid #ccc;
            background-color: #f0f0f0;
            border-radius: 4px;
            cursor: pointer;
        }

        @keyframes flash {
            0% { background-color: #e6f4ff; }
            100% { background-color: transparent; }
        }

        .question.flash {
            animation: flash 1s ease-out;
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.6);
            z-index: 2000;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .modal-content {
            background: white;
            padding: 25px;
            border-radius: 8px;
            width: 100%;
            max-width: 800px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid #ddd;
            padding-bottom: 15px;
            margin-bottom: 20px;
        }
        .modal-header h2 {
            font-size: 24px;
            color: #333;
        }
        .modal-close-btn {
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #888;
            line-height: 1;
        }
        .modal-close-btn:hover {
            color: #333;
        }

        #part-2 .questions-container {
width: 75%;
        }
        #score-summary {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        #result-details table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }
        #result-details th, #result-details td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            vertical-align: middle;
        }
        #result-details th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        #result-details td:nth-child(1) {
            font-weight: bold;
            text-align: center;
        }
        .result-correct {
            color: #28a745;
            font-weight: bold;
        }
        .result-incorrect {
            color: #dc3545;
            font-weight: bold;
        }

        .context-menu-icon {
            width: 16px;
            height: 16px;
            display: inline-block;
            vertical-align: middle;
            margin-right: 8px;
        }

        .matching-container {
            display: flex;
            justify-content: space-between;
            gap: 40px;
            margin-top: 20px;
            align-items: flex-start;
        }
        /* Two-column drag-and-drop layout like screenshot */
        .dnd-col-title { font-weight: 700; margin-bottom: 10px; }
        .matching-question-container { display: flex; gap: 30px; align-items: flex-start; }
        .matching-options-bank { flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .matching-questions { flex: 2; display: flex; flex-direction: column; gap: 24px; }
        .matching-questions .matching-question-item { display: flex; align-items: center; gap: 16px; padding: 6px 0; }
        .matching-questions .matching-question-item span { min-width: 180px; }
        .matching-questions .drop-zone { width: 100%; min-width: 360px; height: 34px; border: 2px dashed #aab3bd; border-radius: 4px; background: #fff; display: flex; align-items: center; padding: 0 8px; justify-content: flex-start; text-align: left; }
        .matching-questions .drop-zone .placeholder { color: #6b7280; font-weight: 700; }
        .matching-options-bank .drag-item { border-radius: 6px; padding: 6px 12px; background: #ffffff; border: 1px solid #d1d5db; font-weight: 600; box-shadow: 0 1px 0 rgba(0,0,0,0.02); }
        .matching-table {
            flex: 4;
            border-collapse: collapse;
        }
        .matching-table th, .matching-table td {
            padding: 6px 12px;
            text-align: left;
            vertical-align: middle;
        }
        .matching-table th {
            background-color: #f8f9fa;
            font-weight: 600;
        }
        .matching-table .drop-zone {
            /* Unify with global drop-zone styling */
            border: 2px dashed #aaa;
            border-radius: 4px;
            height: 25px;
            width: 100%;
            max-width: none;
            min-width: 200px;
            padding: 0.5px 5px;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            flex-wrap: nowrap;
            background-color: transparent;
            word-break: break-word;
            overflow-wrap: break-word;
            text-align: left;
            line-height: 1.2;
            color: #b3b3b3;
            font-weight: 600;
        }
        .matching-table .drop-zone .drag-item {
            width: auto;
            max-width: none;
            text-align: left;
            padding: 6px 8px;
            font-size: 14px;
            line-height: 1.2;
            word-break: break-word;
            overflow-wrap: break-word;
            box-sizing: border-box;
            background: white;
            border: 1px solid #ddd;
            border-radius: 4px;
            margin: 2px;
        }
        .matching-options-list {
            display: flex;
            flex-direction: column;
            gap: 10px;
            flex: 1;
            background-color: transparent;
            padding: 0;
            border: none;
            min-height: 250px;
            min-width: 280px; /* ensure enough width for long option text to stay on one line */
        }
        .matching-options-list .drag-item {
            width: 100%;
        }
        .matching-question-item .drop-zone .placeholder {
            color: #999;
            font-weight: bold;
        }

        /* Clickable cell styles for matching questions */
        .clickable-cell {
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease;
            min-width: 50px;
            min-height: 50px;
            border: 2px solid #e0e0e0;
            position: relative;
            background-color: #f8f9fa;
            margin: 2px;
        }
       
        .clickable-cell:hover {
            background-color: #e6f4ff;
            border-color: #4a90e2;
        }
        .clickable-cell.selected {
            background-color: #75a8e4 !important;
            color: white !important;
        }
       
        .clickable-cell.correct {
            background-color: #28a745 !important;
            color: white !important;
        }
        .clickable-cell.correct::after {
            content: "✓";
            font-weight: bold;
        }
        .clickable-cell.incorrect {
            background-color: #dc3545 !important;
            color: white !important;
        }
        .clickable-cell.incorrect::after {
            content: "✗";
            font-weight: bold;
        }
        
        /* Clickable cell styles for questions 27-30 */
        .clickable-cell {
            cursor: pointer;
            text-align: center;
            transition: all 0.2s ease;
            min-width: 50px;
            min-height: 50px;
            border: 2px solid #e0e0e0;
            position: relative;
            background-color: #f8f9fa;
            margin: 2px;
        }
       
        .clickable-cell:hover {
            background-color: #e6f4ff;
            border-color: #4a90e2;
        }
        .clickable-cell.selected {
            background-color: #4a90e2 !important;
            color: white !important;
        }
        
        .clickable-cell.correct {
            background-color: #28a745 !important;
            color: white !important;
        }
        
        .clickable-cell.incorrect {
            background-color: #dc3545 !important;
            color: white !important;
        }
        

        
        .statement {
            font-weight: 500;
            padding-right: 20px;
        }

        .option strong,
        .question ul li label strong {
            display: none;
        }

        /* Mobile selection toolbar */
        .mobile-selection-menu {
            position: absolute;
            background: #333;
            color: #fff;
            padding: 6px 10px;
            border-radius: 6px;
            display: flex;
            gap: 8px;
            z-index: 3000;
            box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        }
        .mobile-selection-menu button {
            background: transparent;
            border: 1px solid #fff;
            color: #fff;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 14px;
        }
        .mobile-selection-menu.hidden {
            display: none;
        }

        /* === Matching table styling for Questions 13-16 === */
        .matching-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        .matching-table th,
        .matching-table td {
            border: 1px solid #ddd;
            padding: 8px 4px;
            vertical-align: middle;
            text-align: center;
        }
        .matching-table .clickable-cell {
            padding: 8px 4px;
            min-width: 50px;
            min-height: 50px;
        }
        .matching-table th {
            background-color: #1e6de6;
            color: #ffffff;
            font-weight: 600;
            text-align: center;
        }
        .matching-table th:first-child {
            text-align: left;
            background-color: #f8f9fa;
            color: #333;
        }
        .matching-table tbody td:first-child {
            font-weight: 500;
            text-align: left;
            background-color: #f8f9fa;
        }
        .matching-table tr:nth-child(even) td {
            background-color: #f8faff;
        }

        /* === MCQ table styling for Questions 11-15 === */
        .mcq-table {
            width: 100%;
            border-collapse: collapse;
        }
        .mcq-table th,
        .mcq-table td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            vertical-align: middle;
            text-align: center;
        }
        .mcq-table th {
            background-color: #1e6de6; /* vibrant blue header like screenshot */
            color: #ffffff;
            font-weight: 600;
            text-align: center;
        }
        .mcq-table th:first-child {
            text-align: left;
        }
        .mcq-table tbody td:first-child {
            font-weight: 500;
            text-align: left;
        }
        .mcq-table tr:nth-child(even) td {
            background-color: #f8faff; /* subtle alternating row colour */
        }
        .mcq-table input[type="radio"] {
            transform: scale(1.1);
            cursor: pointer;
        }
        /* list of options (A, B, C) shown above the table */
        .mcq-options {
            list-style: none;
            padding-left: 0;
            margin: 10px 0;
        }
        .mcq-options li {
            margin-bottom: 4px;
            font-size: 16px;
        }

        /* MCQ design: full-width selectable panels */
        .multi-choice-question { margin: 12px 0 18px; }
        .multi-choice-option { display:block; width:100%; padding: 12px 14px;  background-color: #fff; border: 1px solid transparent;  transition: background-color 0.2s ease, border-color 0.2s ease; }
        .multi-choice-option:hover { background-color: #f1f7ff; border-color: #c6dcfb; }
        .multi-choice-option:has(input[type="radio"]:checked) { background-color: #cfe3f9; }
        .multi-choice-option label { display: flex; align-items: center; gap: 10px; cursor: pointer; font-size: 16px; width:100%; }

        .aligned-form .question-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
        }
        .aligned-form .question-label {
            width: 230px;
            padding-right: 10px;
        }

        /* Responsive adjustments for tablets */
        @media (max-width: 1024px) {
            .main-container {
                flex-direction: column;
            }
            .right-panel, .main-container.results-mode .right-panel {
                display: none;
            }
            .left-panel, .main-container.results-mode .left-panel {
                width: 100%;
                padding: 20px 10px;
                height: auto; /* Reset height for mobile */
            }
            .questions-container {
                width: 100%;
            }
        }

        .single-choice label.correct {
            color: #155724;
            font-weight: bold;
        }
        .single-choice label.correct::before {
            content: '✔ ';
            color: #28a745;
        }
        .single-choice label.incorrect {
            color: #721c24;
            text-decoration: line-through;
        }
        .single-choice label.incorrect::before {
            content: '✖ ';
            color: #dc3545;
        }
        .mcq-table tbody tr.correct {
            background-color: #d4edda !important;
            color: #155724;
            font-weight: bold;
        }
        .mcq-table tbody tr.incorrect {
            background-color: #f8d7da !important;
            text-decoration: line-through;
        }
        .mcq-table tbody tr.incorrect td {
            color: #721c24;
        }

        /* New Audio Player Styles */
        .audio-player-container {
            position: fixed;
            top: 65px;
            left: 50%;
            transform: translateX(-50%);
            width: 500px;
            max-width: 90%;
            height: 40px;
            background: #f9f9f9;
            border: 1px solid #ddd;
            border-radius: 8px;
            display: flex;
            align-items: center;
            padding: 0 15px;
            z-index: 99;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .main-container {
            margin-top: 115px;
        }
        .player-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 5px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .player-btn svg {
            width: 20px;
            height: 20px;
            fill: #333;
        }
        .progress-container {
            flex-grow: 1;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        #progress-bar {
            flex-grow: 1;
            -webkit-appearance: none;
            appearance: none;
            height: 4px;
            background: #ddd;
            outline: none;
            border-radius: 3px;
            cursor: pointer;
        }
        #progress-bar::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #4a90e2;
            cursor: pointer;
        }
        #progress-bar::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #4a90e2;
            cursor: pointer;
            border: none;
        }
        #current-time, #total-duration {
            font-size: 12px;
            color: #555;
            min-width: 35px;
            text-align: center;
        }
        .controls-container {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .volume-container {
            display: flex;
            align-items: center;
            position: relative;
        }
        #new-volume-slider {
            -webkit-appearance: none;
            appearance: none;
            width: 60px;
            height: 3px;
            background: #ccc;
            outline: none;
            border-radius: 2px;
            cursor: pointer;
            margin-left: 8px;
            display: block; 
        }
    
        #new-volume-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #333;
        }
        #new-volume-slider::-moz-range-thumb {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #333;
            border: none;
        }
        .speed-container {
            position: relative;
        }
        #speed-btn {
            font-size: 12px;
            font-weight: 600;
            color: #333;
            background-color: #e9ecef;
            border: 1px solid #ced4da;
            border-radius: 4px;
            padding: 4px 8px;
        }
        #speed-options {
            position: absolute;
            top: calc(100% + 5px); /* Position below the button with a small gap */
            right: 0;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            z-index: 100;
        }
        #speed-options div {
            padding: 8px 15px;
            cursor: pointer;
        }
        #speed-options div:hover {
            background-color: #f0f0f0;
        }

        /* Flowchart styles */
        .flowchart-container {
            border: 1px solid #ccc;
            padding: 0 20px;
        }
        .flowchart-step {
            text-align: center;
            margin: 0;
            padding: 20px 0;
            border-top: 1px solid #ddd;
        }
        .flowchart-step:first-child {
            border-top: none;
            padding-top: 20px;
            margin-top: 0;
        }
        .flowchart-arrow {
            text-align: center;
            margin: 0;
            padding: 15px 0;
            font-size: 20px;
            color: #555;
            border-top: 1px solid #ddd;
        }
        .flowchart-split {
            display: flex;
            justify-content: space-between;
            align-items: stretch;
            gap: 20px;
            border-top: 1px solid #ddd;
        }
        .flowchart-split-col {
            width: 48%;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
        .flowchart-split .flowchart-step {
            border-top: none;
            padding-top: 0;
            margin-top: 0;
            flex-grow: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px 0;
        }
        .flowchart-split .flowchart-arrow {
            border-top: none;
            padding: 15px 0;
        }


        /* Responsive adjustments for tablets */
        @media (max-width: 1024px) {
            .main-container {
                flex-direction: column;
            }
            .right-panel, .main-container.results-mode .right-panel {
                display: none;
            }
            .left-panel, .main-container.results-mode .left-panel {
                width: 100%;
                padding: 20px 10px;
                height: auto; /* Reset height for mobile */
            }
            .questions-container {
                width: 100%;
            }
            
            /* Adjust input boxes for tablets */
            .answer-input {
                width: 90px;
                max-width: 110px;
                font-size: 15px;
            }
            
            .drop-zone {
                max-width: 110px;
                min-width: 90px;
            }
            
            .matching-table .drop-zone {
                max-width: 110px;
                min-width: 90px;
            }
        }
        
        /* Responsive adjustments for mobile phones */
        @media (max-width: 768px) {
            .answer-input {
                width: 80px;
                max-width: 100px;
                font-size: 14px;
                padding: 2px 4px;
            }
            
            .drop-zone {
                max-width: 100px;
                min-width: 80px;
                font-size: 14px;
            }
            
            .matching-table .drop-zone {
                max-width: 100px;
                min-width: 80px;
            }
            
            .drag-item {
                font-size: 13px;
                padding: 4px 6px;
            }
            
            .matching-table .drop-zone .drag-item {
                font-size: 12px;
            }
            
            /* Ensure drag-drop containers are more mobile-friendly */
            .drag-drop-container {
                flex-direction: column;
                gap: 15px;
            }
            
            .matching-container {
                flex-direction: column;
                gap: 20px;
            }
        }
        
        /* Extra small screens */
        @media (max-width: 480px) {
            .answer-input {
                width: 70px;
                max-width: 90px;
                font-size: 13px;
            }
            
            .drop-zone {
                max-width: 90px;
                min-width: 70px;
            }
            
            .matching-table .drop-zone {
                max-width: 90px;
                min-width: 70px;
            }
        }

        /* ===== Imported designs from Reading 4.html ===== */
        /* TRUE/FALSE/NOT GIVEN styles */
        .tf-question { margin-bottom: 25px; padding: 10px 0; border-radius: 4px; }
        .tf-question-line { display: flex; align-items: flex-start; margin-bottom: 15px; padding: 5px 0; border-radius: 4px; }
        .tf-question-number, .question-number-box { border: 2px solid #ccc; padding: 2px 8px; margin-right: 10px; border-radius: 3px; font-weight: bold; display: inline-block; }
        .tf-question.active-question .tf-question-number { border-color: #4a90e2; }
        .tf-question-text { padding-top: 3px; }
        .tf-options { padding-left: 5px; }
        .tf-option { display: flex; align-items: center; padding: 10px 12px; background-color: #fff; transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
        .tf-option:hover { background-color: #f1f7ff; border-color: #c6dcfb; }
        .tf-option.correct { background-color: #d4edda !important; border-color: #28a745 !important; }
        .tf-option.incorrect { background-color: #f8d7da !important; border-color: #dc3545 !important; }
        .tf-option input[type="radio"] { margin-right: 10px; transform: scale(1.2); }
        .tf-question.correct .tf-question-line { background-color: #e9f7ef; }
        .tf-question.incorrect .tf-question-line { background-color: #f8d7da; }

        /* Multi-choice question styles */
        .multi-choice-question { margin-bottom: 20px; padding: 10px; border-radius: 4px; border: 3px solid transparent; }
        .multi-choice-question .question-prompt p > strong:first-child { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; padding: 2px 6px; margin-right: 8px; border: 1px solid #d0d7e2; border-radius: 6px; background: #fff; }
        .multi-choice-question.active-question .question-prompt p > strong:first-child { border-color: #4a90e2; border-width: 2px; }
        .multi-choice-option { padding: 10px 12px; background-color: #fff; transition: background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease; }
        .multi-choice-option:hover { background-color: #f1f7ff; border-color: #c6dcfb; }
        .multi-choice-option.correct { background-color: #d4edda !important;  }
        .multi-choice-option.incorrect { background-color: #f8d7da !important;  }
        .multi-choice-option label { display: flex; align-items: center; cursor: pointer; font-size: 16px; }
        .multi-choice-option input[type="checkbox"], .multi-choice-option input[type="radio"] { margin-right: 12px; transform: scale(1.3); accent-color: #4a90e2; }

        /* Checkbox TWO-answers block (match screenshot) */
        .checkbox-question .question-prompt p > strong:first-child {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 24px;
           
            background: #fff;
        }
        .checkbox-group { display: flex; flex-direction: column;  }
        .checkbox-group label { display: flex; align-items: center; padding: 10px 12px; border: 1px solid transparent; background: #fff; transition: background-color 0.2s, border-color 0.2s; }
        .checkbox-group label:hover { background: #f1f7ff; border-color: #c6dcfb; }
        .checkbox-group label:has(input[type="checkbox"]:checked) { background: #cfe3f9; }
        .checkbox-group input[type="checkbox"] { margin-right: 10px; transform: scale(1.2); }
        .checkbox-group label.correct { background-color: #d4edda !important; }
        .checkbox-group label.incorrect { background-color: #f8d7da !important;  }
        .checkbox-group label.correct::before { content: '✔ '; color: #28a745; font-weight: 600; margin-right: 6px; }
        .checkbox-group label.incorrect::before { content: '✖ '; color: #dc3545; font-weight: 600; margin-right: 6px; }

        /* Drag & Drop enhancements */
        /* Filled zone should look like an input with blue border */
        .drop-zone.filled { background-color: #ffffff; border: 2px solid #2c6bed !important; outline: none !important; box-shadow: none !important; padding: 6px 10px; border-radius: 4px; }
        .drop-zone.filled .drag-item { width: auto; height: auto; display: inline-block; border: none; border-radius: 0; padding: 0; font-weight: 500; background: transparent; box-shadow: none; white-space: nowrap; }

        /* ===== Results Modal UI ===== */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 3000; padding: 20px; }
        .modal-content { background: #ffffff; width: 100%; max-width: 900px; max-height: 85vh; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.25); overflow: hidden; display: flex; flex-direction: column; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; padding: 14px 18px; border-bottom: 1px solid #e5e7eb; background: #f8fafc; position: sticky; top: 0; z-index: 1; }
        .modal-header h2 { margin: 0; font-size: 20px; font-weight: 700; color: #111827; }
        .modal-close-btn { background: transparent; border: none; font-size: 26px; line-height: 1; cursor: pointer; color: #6b7280; }
        .modal-close-btn:hover { color: #111827; }
        .modal-body { padding: 16px 18px; overflow: auto; }
        #score-summary { font-size: 16px; font-weight: 600; color: #111827; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 10px 12px; border-radius: 8px; display: inline-block; }
        .result-controls { display: flex; align-items: center; gap: 12px; margin: 12px 0; }
        .result-controls .spacer { flex: 1; }
        .result-controls label { display: inline-flex; align-items: center; gap: 6px; color: #374151; }
        .btn-secondary { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #ffffff; color: #111827; cursor: pointer; }
        .btn-secondary:hover { background: #f8fafc; }
        #result-details { overflow: auto; }
        #result-details table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; }
        #result-details th, #result-details td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; text-align: left; font-size: 14px; }
        #result-details thead th { position: sticky; top: 0; background: #f1f5f9; z-index: 1; }
        #result-details tr:nth-child(even) td { background: #fafafa; }
        #result-details td.result-correct { color: #0f5132; font-weight: 600; }
        #result-details td.result-incorrect { color: #842029; font-weight: 600; }
    

/* Overrides for React compatibility */
body { margin: 0; padding: 0; }
.main-container { padding-top: 130px; } /* account for header + audio */
.nav-row { display: flex !important; }
.t-hl { cursor: pointer; color: blue; text-decoration: underline; }
`;

export default function ListeningTestPage() {
  const navigate = useNavigate()
  
  const [currentPart, setCurrentPart] = useState(1)
  const [answers, setAnswers] = useState({})
  
  const [timeLeft, setTimeLeft] = useState(3600)
  const [isPaused, setIsPaused] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [volume, setVolume] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  
  const [resultModal, setResultModal] = useState({ visible: false, score: 0, bandScore: '0', timeSpent: 0 })
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetHighlight: null, hasSelection: false, savedRange: null })
  
  const audioRef = useRef(null)
  
  const correctAnswers = {
      1: ['headmaster', 'the headmaster'],
      2: ['smith'],
      3: ['education'],
      4: ['keep'],
      5: ['mood'],
      6: ['pool'],
      7: ['rowing'],
      8: ['article', 'an article'],
      9: ['hall'],
      10: ['music'],
      11: ['A'], 12: ['A'], 13: ['B'], 14: ['B'], 15: ['A'],
      16: ['B'], 17: ['F'], 18: ['D'], 19: ['G'], 20: ['C'],
      21: ['home'], 22: ['dinner'], 23: ['technical'], 24: ['slang'],
      25: ['cooperating', 'cooperation'], 26: ['persuading'], 27: ['editing'],
      28: ['complete'], 29: ['experiment'], 30: ['long'],
      31: ['58'], 32: ['desert'], 33: ['science'], 34: ['hospital'],
      35: ['ship', 'a ship'], 36: ['platforms'], 37: ['3500', '3,500'],
      38: ['currents'], 39: ['pollution'], 40: ['young']
  };

  useEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = legacyCss
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  useEffect(() => {
    let timer
    if (!isPaused && !isSubmitted && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0 && !isSubmitted) {
      handleSubmit()
    }
    return () => clearInterval(timer)
  }, [isPaused, isSubmitted, timeLeft])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)
    
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleProgressChange = (e) => {
    const time = parseFloat(e.target.value)
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }
  
  const handleVolumeChange = (e) => {
    const v = parseFloat(e.target.value)
    audioRef.current.volume = v
    setVolume(v)
  }
  
  const handleSpeedChange = (speed) => {
    audioRef.current.playbackRate = speed
    setPlaybackRate(speed)
    setShowSpeedMenu(false)
  }
  
  const jumpToTime = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
      if (!isPlaying) {
         audioRef.current.play()
         setIsPlaying(true)
      }
    }
  }

  const handleAnswerChange = (qNum, value) => {
    setAnswers(prev => ({ ...prev, [qNum]: value }))
  }

  const formatTimeStr = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return m + ':' + (sec < 10 ? '0' : '') + sec
  }

  const jumpToQuestion = (q) => {
    let targetPart = 1
    if (q >= 11 && q <= 20) targetPart = 2
    if (q >= 21 && q <= 30) targetPart = 3
    if (q >= 31 && q <= 40) targetPart = 4
    setCurrentPart(targetPart)
    
    setTimeout(() => {
      const el = document.getElementById(`q${q}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 100)
  }

  const handleSubmit = async () => {
    if (isSubmitted) return
    setIsSubmitted(true)
    setIsPaused(true)
    if (isPlaying) togglePlay()

    let correctCount = 0
    for (let i = 1; i <= 40; i++) {
      const userAns = (answers[i] || '').trim().toLowerCase()
      const correctArr = correctAnswers[i] || []
      const isCorrect = correctArr.some(ans => ans.toLowerCase() === userAns)
      if (isCorrect) correctCount++
    }

    const bandScore = calculateListeningBand(correctCount)
    const timeSpent = 3600 - timeLeft

    await saveTestResult({
      testType: 'listening',
      testId: 'listening-1',
      score: correctCount,
      totalQuestions: 40,
      bandScore,
      timeSpent,
      answers
    })
    
    setResultModal({ visible: true, score: correctCount, bandScore, timeSpent })
  }

  // Highlights and Context Menu
  const handleContextMenu = (e) => {
    e.preventDefault()
    const selection = window.getSelection()
    let hasSel = selection && selection.toString().trim().length > 0
    let savedRange = null
    if (hasSel) {
      savedRange = selection.getRangeAt(0)
    }

    let targetHl = e.target.closest('.highlight, .comment-highlight')
    
    if (hasSel || targetHl) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        hasSelection: hasSel,
        savedRange: savedRange,
        targetHighlight: targetHl
      })
    } else {
      setContextMenu({ ...contextMenu, visible: false })
    }
  }

  const handleHighlight = () => {
    if (!contextMenu.savedRange) return
    try {
      const span = document.createElement('span')
      span.className = 'highlight'
      contextMenu.savedRange.surroundContents(span)
    } catch(e) {}
    setContextMenu({ ...contextMenu, visible: false })
    window.getSelection().removeAllRanges()
  }

  const handleClearHighlight = () => {
    if (!contextMenu.targetHighlight) return
    const el = contextMenu.targetHighlight
    const parent = el.parentNode
    while (el.firstChild) {
      parent.insertBefore(el.firstChild, el)
    }
    parent.removeChild(el)
    setContextMenu({ ...contextMenu, visible: false })
  }

  const handleClearAllHighlights = () => {
    document.querySelectorAll('.highlight, .comment-highlight').forEach(el => {
      const parent = el.parentNode
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el)
      }
      parent.removeChild(el)
    })
    setContextMenu({ ...contextMenu, visible: false })
  }

  const closeMenu = () => {
    if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false })
  }
  
  // Highlight correct answers in transcripts if submitted
  const renderTranscript = (partJsxStr) => {
    let processed = partJsxStr
    // The transcription html contains <span className="t-hl" data-q="1" data-time="125">
    // We want to make them clickable to jump to time.
    // In React, dangerouslySetInnerHTML doesn't execute onClick. We will use a ref and event delegation.
    
    if (isSubmitted) {
      // Actually the t-hl tags already exist. We just need to make them yellow or something to show correct answer?
      // In the original, maybe they were always visible? The user says "check anwer highlighlar ishlashi shart".
      // Let's add a visual class if submitted.
      processed = processed.replace(/className="t-hl"/g, 'className="t-hl highlight"')
    }
    
    return { __html: processed }
  }

  const handleTranscriptClick = (e) => {
     const tHl = e.target.closest('.t-hl')
     if (tHl) {
         const time = tHl.getAttribute('data-time')
         if (time) jumpToTime(parseFloat(time))
     }
  }
  
  // Process check answers UI
  const getSubQuestionClass = (qNum) => {
    if (isSubmitted) {
      const userAns = (answers[qNum] || '').trim().toLowerCase()
      const correctArr = correctAnswers[qNum] || []
      const isCorrect = correctArr.some(ans => ans.toLowerCase() === userAns)
      return isCorrect ? 'subQuestion correct' : 'subQuestion incorrect'
    }
    return answers[qNum] ? 'subQuestion answered' : 'subQuestion'
  }

  return (
    <div className="legacy-wrapper" onClick={closeMenu}>
      <audio ref={audioRef} src="https://ia600906.us.archive.org/1/items/listeening/listeening.mp3" preload="metadata"></audio>
      
      <div className="header">
        <div className="timer-container" style={{display: 'block'}}><span className="timer-display">{formatTimeStr(timeLeft)}</span></div>
        <Link to="/dashboard" className="exit-header-btn" style={{display:'inline-flex',alignItems:'center',gap:'6px',padding:'6px 16px',background:'#FFF0F0',color:'#FF3131',border:'1.5px solid #FF3131',borderRadius:'9999px',fontWeight:'700',fontSize:'13px',textDecoration:'none',transition:'all 0.2s'}}>← Exit to Dashboard</Link>
        <div></div>
      </div>

      <div className="audio-player-container" style={{top: '60px'}}>
        <button className="player-btn" onClick={togglePlay}>
          {isPlaying ? (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
          )}
        </button>
        <div className="progress-container">
            <span id="current-time">{formatTimeStr(currentTime)}</span>
            <input type="range" min="0" max={duration || 100} value={currentTime} onChange={handleProgressChange} style={{width:'100%'}} />
            <span id="total-duration">{formatTimeStr(duration)}</span>
        </div>
        <div className="controls-container">
            <div style={{display:'flex',alignItems:'center'}}>
                <button className="player-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                </button>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={handleVolumeChange} />
            </div>
            <div className="speed-container" style={{position: 'relative'}}>
                <button className="player-btn" onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); }}>{playbackRate}x</button>
                {showSpeedMenu && (
                    <div style={{position:'absolute', bottom:'100%', right:0, background:'white', border:'1px solid #ccc', borderRadius:'4px', zIndex: 100, padding: '5px 0'}}>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(s => (
                            <div key={s} onClick={() => handleSpeedChange(s)} style={{padding: '5px 15px', cursor: 'pointer', background: s===playbackRate?'#eee':'transparent', fontSize:'14px', color:'black'}}>{s}x</div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      <div className="main-container" onContextMenu={handleContextMenu}>
        <div className="left-panel">
          {currentPart === 1 && (
            <div id="part-1" className="question-part">

</div>
          )}
          {currentPart === 2 && (
            <div id="part-2" className="question-part">

</div>
          )}
          {currentPart === 3 && (
            <div id="part-3" className="question-part">

</div>
          )}
          {currentPart === 4 && (
            <div id="part-4" className="question-part">

</div>
          )}
        </div>
        
        <div className="right-panel">
            <div id="transcription-container">
                <h2 style={{fontSize:'18px',fontWeight:'bold',marginBottom:'10px'}}>Transcription</h2>
                <div id="transcription-text" onClick={handleTranscriptClick} style={{lineHeight: 1.6, fontSize: '15px'}}>
                   {currentPart === 1 && <div dangerouslySetInnerHTML={renderTranscript(`You will hear a number of different recordings, and you will have to answer questions on what you hear. There will be time for you to read the instructions and questions, and you will have a chance to check your work. All the recordings will be played once only.

The test is in four sections. Write all your answers in the Listening Question Booklet. At the end of the test, you will be given ten minutes to transfer your answers to an answer sheet.

Now turn to section 1 on page 2 of your question booklet. Section 1 You will hear a man phoning to ask about a festival in a town called Beechin. First you have some time to look at questions 1 to 6 on page 2. You will see that there is an example that has been done for you.

On this occasion only, the conversation relating to this will be played first. Beechin Festival Office Oh, hello. I want to check some details about the festival.

I know tickets are running out fast, and I haven't got access to the internet at present, my computer's down. OK. Well, the first activity is on June the 19th at 7pm, and it's a concert with local musicians performing.

Oh, lovely. The activity on June the 19th is a concert, so concert has been written in the space. Now we shall begin.

You should answer the questions as you listen, because you will not hear the recording a second time. Listen carefully and answer questions 1 to 6. Beechin Festival Office Oh, hello. I want to check some details about the festival.

I know tickets are running out fast, and I haven't got access to the internet at present, my computer's down. OK. Well, the first activity is on June the 19th at 7pm, and it's a concert with local musicians performing.

Oh, lovely. Is it in the theatre, like last year? Yes, that's right. And for the next activity, on the 20th, the times changed.

Is that the tour? Yes. Now, it does say on the tickets that it's a 3.40 start, but that's an error. There wasn't time to update them, unfortunately, so it should say 4.30 instead.

The correct time is on the website, though. Oh, right. Because one of my friends wants to go on that, to see Beechin with an expert and find out about the town and its history.

Does she need to get a ticket in advance? No, just turn up at the station where the guide will be waiting. They'll start from there, and I think the plan is to stop for a break in the park. And there's no charge for the tour.

And the tour will finish with a visit to the 16th century mill where they used to make flour. It's recently been restored. Fine.

And then on the 21st, there's an all-day event for children. Oh, that could be good for my visitors. They're bringing theirs, you see.

Right. Well, the plan was to have a painting competition for the kids, but it's now going to be cooking instead. And there'll be prizes for all the different age groups.

Oh, great. And it's in Beechin Community Centre. Oh, yes, I know where that is.

They don't need to bring any ingredients, but they'll need to have a plate to put whatever they've made on so they can display it and then take it home. Sounds good. And are they going ahead with the fireworks in the evening, or is that cancelled? There was an article in the paper after last year's display which suggested it might not be happening again.

That's right. No, that's still on. It's getting more popular each year, and having it in the town square was starting to be a bit difficult because of the numbers, which is why it's next to the river this time.

It'll be easy for large numbers of people to get to. Yes, of course. I'm sure there's lots to look forward to.

Before you hear the rest of the conversation, you have some time to look at questions 7 to 10 on page 2. Now listen and answer questions 7 to 10. OK, now I just want to check how it's going to impact on me as a local resident. I mean, some people last year thought it was too noisy at night.

Yes, I know. And that's why this year evening events won't go on beyond 11.15. I know previously some activities lasted until 11.45, and the new time applies now to all the events, every evening. OK.

And another change, perhaps you know about this already, is that because of high visitor numbers, parking in the town centre isn't going to be allowed. It'll be outside town. Oh, yes, to keep the streets clear, I suppose, for all the visitors.

I did know, actually, and it's not really going to be a problem for me. Right. I mean, I can just walk into town from my home.

OK. Well, anyway, if you want to check any more details about the festival, once you're back online, you can look at www.events.com and you'll be able to comment on what activities you enjoyed and that kind of thing. This will help the organisers would be if people could use the website to give feedback about what they enjoyed and that kind of thing. This will help them plan for next year.

That's probably a good idea. And with pricing, I know... That is the end of Section 1. You now have half a minute to check your answers.`)} />}
                   {currentPart === 2 && <div dangerouslySetInnerHTML={renderTranscript(`Now turn to Section 2 on page 3. Section 2 You will hear a tour guide talking to some tourists who are going on a walking holiday in Spain.

First you have some time to look at questions 11 to 14 on page 3. Now listen carefully and answer questions 11 to 14. Well, good evening, everyone. My name's Gary Payne and I'll be the leader for your walking holiday in Spain.

And the purpose of this evening's meeting is for us all to get to know each other in advance and for you to ask any questions you may have about the holiday. So I'll begin by telling you a little bit about what to expect. Now, the ferry crossing from England to Santander in Spain takes about 24 hours.

We'll be sailing on the Prince Regent, which was first launched in the 1980s. As well as the crew of 160, it can accommodate about 2,000 people and 600 cars. And it sails at an average speed of 37 km an hour.

There'll be an on-board map on one of the decks, which charts the ship's progress during the voyage. Although our minibus will be on one of the vehicle decks in the boat, access to these decks is prohibited during the crossing, so when you leave our bus, you'll have to take everything that you're likely to need with you, like toiletries or books and magazines. In fact, it's probably a good idea to put these things in a separate bag beforehand.

You shouldn't need snacks on board as meals are provided and they're quite substantial. And if you don't feel well or get a headache, you can get tablets from me. I always carry an adequate supply.

Now, once we're in Spain, we'll be based at a hostel in a small village called La Vega de Libana, about 120 km from Santander. It's a very picturesque area that's retained a lot of its traditional industry and culture. The hostel accommodation's fairly simple.

There are bunk beds and each room holds four to eight people. But the bathrooms and showers are of a high standard. The hostel residents have the use of tennis courts nearby, if you feel like a game.

We'll be given breakfast and an evening meal at the hostel. In general, the hostel is relaxed, but there are a few rules which the owners enforce strictly. Smoking is not allowed anywhere inside the building and food and drink is banned in the dormitories.

Any chairs or tables which you take outside into the gardens must be returned every evening to their original place. And finally, the doors are locked after midnight out of consideration for other guests who are trying to sleep. Before you hear the rest of the talk, you have some time to look at questions 15 to 20 on page 4. Now listen and answer questions 15 to 20.

Now, that's enough about travel and accommodation. But before I move on, I should say something briefly about equipment. There's a list in the guidebook you've been sent, but I'll just elaborate on one or two items.

First, boots. Make sure that the ones you bring have thick soles. That's the most important thing.

Don't bring trainers for walking in. Apart from anything else, they're dangerous because they slip. It's important to bring spare socks.

Then, about waterproofs. I'd strongly advise you not to come with anything heavy, you know, with a thick lining. The ideal things are those lightweight ones, because they fold up small, and although they do keep the wind out, they don't make you too hot.

Right? Next, sun cream. This is absolutely essential. And regarding the strength, make sure you get what's known as total block.

Even factor 25 isn't good enough for those latitudes in July. Then, let's see. Bring a folder to keep your map and other papers in, you know, one of those plastic ones.

It's not very likely to rain, but if it does, you'll find it soaks everything. So, that's the practicalities over. Now let me tell you a little bit about the area in Spain where we'll be walking, the Picos de Europa.

It's a very popular area for tourists because of its spectacular peaks. Although they're only 25 kilometres from the sea, the highest peaks are more than 2,600 metres high and have year-round snow caps. On the highest peaks, you've got alpine plants that are only free of their snow cover for a few months a year.

Then you've got meadows that are full of wildflowers at certain times of the year. Then the northern slopes are covered by woodlands, giving homes to rare species such as wolves and bears. And because of the variety of plant life, which survives in that part of Europe due to the traditional way of life there... That is the end of Section 2. You now have half a minute to check your answers.`)} />}
                   {currentPart === 3 && <div dangerouslySetInnerHTML={renderTranscript(`Now turn to Section 3 on page 5. Section 3 You will hear two students called Sally and Steve discussing Sally's project on peer assessment, a system where students mark each other's work. First you have some time to look at questions 21 to 24 on page 5. Now listen carefully and answer questions 21 to 24. I can't believe you're still in the library, Sally.

You've been here all day. Are you still working on your peer assessment project? Hi, Steve. Yes, I'm still here and I'm nowhere near finished.

I'm still processing the reading I've done on peer assessment. I'm interested to see if students marking each other's work is beneficial. I know a lot of the other students are pretty sceptical about its value as a way of assessing their performance.

They think the tutors are in favour of it because they don't have to spend so long marking. But I disagree. I think we can learn a great deal from it.

Yes, I can see one advantage being that it saves time spent going over things in class. Well, initially it doesn't seem to work that way and it can be quite a time-consuming business because sometimes things have to be marked again if the tutor thinks the student's assessments aren't reliable. The real gain is the fact that the students learn to stand back and assess their own assignments objectively because they're much more familiar with the marking system.

Yes, I can see that. It gives them an opportunity to reflect on their own performance. And how do they feel about having another student mark their work? Is that good for rapport? In some cases yes, in some cases no.

I think more research is needed to answer that question. What happens if a tutor notices that the marks for a particular assignment seem wrong? Should the students mark them again? That might not make any difference. So in that case the tutor would have to remark all those assignments and then go through the marking criteria really carefully with the students on the next assignment with some sample answers.

I've been reading about a research project on peer assessment. The researchers invited a group of students from two different universities to attend a one-day conference. They also invited some university lecturers to attend.

Each student gave a short presentation on a project of their choice. Each of these presentations was assessed individually by all the participants, both students and lecturers. To support their marking, they used a set of assessment guidelines that had been prepared the day before by a random selection of students.

Before you hear the rest of the discussion, you have some time to look at questions 25 to 30 on page 6. Now listen and answer questions 25 to 30. So were the student markers reliable? Well, comparisons were made between certain categories of student markers and the group as a whole, including the lecturers. The findings showed that there were some variations in the way different groups marked.

Gender did come into play, for example. I expect the male students were more generous when marking female presenters, were they? Quite the reverse, actually. They were harder on the female presenters than on the males, which wasn't what I'd expected either.

Did female students show any bias towards male presenters? Interestingly not. So does that suggest women are fairer and more reliable markers than men? Well, I wouldn't go that far. It's only a small sample.

But significantly, the results showed that when women marked other women, this didn't affect the grades they gave. What about age? Were you able to come to any conclusions about that? Yes, because we had some mature students presenting and we found the marks awarded to them by their younger peers were rather more generous. I wonder why that is.

Now, you said there were groups of students from two universities. Did they tend to favour students making presentations from their own universities? It didn't seem to influence marking one way or the other, which is quite encouraging. We'd been interested to see if students' personal relationships affected their objectivity.

One striking variation, though, was in the students who'd been asked to help devise the criteria for the marking scheme. They were actually the toughest markers of all, marking consistently below the tutors. Really? Well, it sounds as if it's generated lots of useful data.

I expect you'll be here for... That is the end of section 3. You now have half a minute to check your answers.`)} />}
                   {currentPart === 4 && <div dangerouslySetInnerHTML={renderTranscript(`Now turn to section 4 on page 7. Section 4 You will hear part of a linguistics lecture about a language called Bishlama that is spoken in the Pacific Islands. First, you have some time to look at questions 31-40 on page 7. Now listen carefully and answer questions 31-40.

Good morning and welcome back to this series of linguistics lectures. Today I will be talking about the language Bishlama, which is a form of pidgin English. Linguists use the term pidgin to describe new languages that are created by combining two or more existing languages, often in a simplified form.

The study of pidgin languages is important because it provides us with information about language change and modification. The pidgin English known as Bishlama is used in the South Pacific nation of Vanuatu, a group of islands where 81 first languages are still regularly used by the local people. There are a further 17 local languages that are in danger of dying out and 8 that have been identified as extinct.

This gives a total of 106 first languages in all, a very high number for a small country with a population of just 200,000 people. Then thinking about foreign languages, English is the most important and has official status largely because it is the medium for all education purposes. However, it is Bishlama that is the most widely spoken language in the country, used regularly by more than 90% of the population.

We should note here that in earlier times some people had negative feelings towards the language. In fact, for many years it was commonly referred to as a broken language and its use was discouraged. But attitudes have changed dramatically and today the people of Vanuatu are very proud of this unique language.

It is only when we understand the historical context that we can comprehend just why Bishlama developed in Vanuatu. The first form of Pidgin English in this region can be traced to around 1800 when foreign traders arrived and local people were recruited to work as sailors. On board multilingual ships there was an obvious need for a common tongue and Pidgin English was born.

This early form of Bishlama continued to spread as trade in the Pacific developed in sandalwood and other local commodities. Then from about 1860 a lot of people from Vanuatu travelled to Australia to work on the new plantations as labourers. Again, because of the multilingual nature of these workplaces it was very important to have a common language.

Finally, in modern times there have been other pressures that have maintained the need for a common language. Like many other parts of the world from about the 1950s Vanuatu experienced a significant migration of its people from small villages into the city and it has been here that Bishlama has really established itself as the country's first language. So then, how can we describe the language itself? In general terms Pidgin languages can be defined as extremely simple versions of the original language.

However, this is not a satisfactory definition in this case and linguists prefer to describe Bishlama as a developed pidgin because it has more rules and ideas than most simple pidgin languages found in other parts of the world. Let's think first about the vocabulary. Because Britain was the colonial power the majority of Bishlama's vocabulary is derived from English.

However, some care needs to be taken here. For example, the word from in Bishlama can also mean because of so we need to be aware that words can have a wider range of meanings in Bishlama. Indeed, there are numerous other potentially misleading terms and English is not the only contributor to the vocabulary.

Again, because of the region's history there are some words, around 5-10% that are derived from French. Then, a relatively small number of words have been taken from local, Pacific languages. Usually, this is the case where there is no English equivalent for naturally occurring phenomena or to describe some aspect of the culture that is unique to the country.

Finally, a word about grammar. Although the vocabulary is based largely on English it's important to note that the grammatical structure of Bishlama is derived from patterns common in the local languages of Vanuatu. So, for example, there are two distinct pronouns meaning we, one means I and you and another means I and some others but not you.

Sounds confusing in English but in the local languages such distinctions are common. A different example concerns the word long. It is almost the only preposition in Bishlama and may be used in place of a whole range of English words such as at, to, with, on, in and so on.

Well, that is the end of the formal part of the lecture. If you have any questions now, I'll be most happy to answer them. That is the end of section four.

You now have half a minute to check your answers. That is the end of the listening test. You now have ten minutes to transfer your answers to the listening answer sheet.`)} />}
                </div>
            </div>
        </div>
      </div>

      <div className="nav-arrows">
        <button className="nav-arrow" onClick={() => setCurrentPart(p => Math.max(1, p - 1))} disabled={currentPart === 1}>‹</button>
        <button className="nav-arrow" onClick={() => setCurrentPart(p => Math.min(4, p + 1))} disabled={currentPart === 4}>›</button>
      </div>

      <nav className="nav-row" aria-label="Questions">
        {[1, 2, 3, 4].map(part => {
          const startQ = (part - 1) * 10 + 1
          const endQ = part * 10
          let answered = 0
          for(let i=startQ; i<=endQ; i++) if(answers[i]) answered++
          
          return (
            <div key={part} className={`footer__questionWrapper___1tZ46 ${currentPart === part ? 'selected' : ''}`} style={{flex:1, position:'relative'}}>
                <button className="footer__questionNo___3WNct" onClick={() => setCurrentPart(part)}>
                    <span><span className="section-prefix">Part </span><span className="sectionNr">{part}</span>
                    <span className="attemptedCount">{answered} of 10</span></span>
                </button>
                <div className="footer__subquestionWrapper___9GgoP">
                    {Array.from({ length: 10 }).map((_, i) => {
                       const q = startQ + i
                       return <button key={q} className={getSubQuestionClass(q)} onClick={() => jumpToQuestion(q)}><span>{q}</span></button>
                    })}
                </div>
            </div>
          )
        })}
        
        <button onClick={handleSubmit} disabled={isSubmitted} className={`footer__deliverButton___3FM07 ${isSubmitted ? 'success' : ''}`}>
          <span>{isSubmitted ? 'Test Completed' : 'Check Answers'}</span>
        </button>
      </nav>

      {/* Context Menu */}
      {contextMenu.visible && (
        <div className="context-menu" style={{
          display: 'block', left: contextMenu.x, top: contextMenu.y,
          position: 'fixed', background: 'white', border: '1px solid #ccc',
          borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1000, minWidth: '140px'
        }}>
          {contextMenu.hasSelection && (
            <div className="context-menu-item" onMouseDown={(e) => { e.preventDefault(); handleHighlight(); }} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', color: 'black' }}>
              Highlight
            </div>
          )}
          {contextMenu.targetHighlight && (
            <div className="context-menu-item" onMouseDown={(e) => { e.preventDefault(); handleClearHighlight(); }} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f0f0f0', color: 'black' }}>
              Clear
            </div>
          )}
          <div className="context-menu-item" onMouseDown={(e) => { e.preventDefault(); handleClearAllHighlights(); }} style={{ padding: '12px 16px', cursor: 'pointer', color: 'black' }}>
            Clear All
          </div>
        </div>
      )}

      {/* Result Modal */}
      {resultModal.visible && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(3px)'
        }}>
          <div style={{
            background: 'white', padding: '30px 40px', borderRadius: '16px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%',
            textAlign: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif"
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%', background: '#e6f4ea',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#137333" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: 'bold', color: '#1a1a1a' }}>Test Completed!</h2>
            <p style={{ margin: '0 0 20px', color: '#5f6368', fontSize: '15px' }}>
              Your answers have been submitted successfully.
            </p>
            <div style={{ background: '#f8f9fa', borderRadius: '12px', padding: '15px', marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #e0e0e0' }}>
                <span style={{ color: '#5f6368', fontWeight: 500 }}>Correct Answers</span>
                <span style={{ fontWeight: 'bold', color: '#1a1a1a' }}>{resultModal.score} / 40</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#5f6368', fontWeight: 500 }}>IELTS Band</span>
                <span style={{ fontWeight: 'bold', color: '#FF3131' }}>{resultModal.bandScore}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setResultModal(prev => ({ ...prev, visible: false }))}
                style={{ flex: 1, padding: '12px', background: 'white', border: '1px solid #dadce0', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#1a1a1a' }}
              >
                Review Answers
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                style={{ flex: 1, padding: '12px', background: '#FF3131', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: 'white' }}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
