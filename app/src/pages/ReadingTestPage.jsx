import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ReadingTest1Data } from '../data/reading-data'
import { calculateReadingBand, formatSeconds } from '../lib/scoring'
import { saveTestResult } from '../lib/supabase'

import '../legacy-test.css' // Import the legacy CSS

export default function ReadingTestPage() {
  const navigate = useNavigate()
  const [currentPart, setCurrentPart] = useState(1)
  const [currentQ, setCurrentQ] = useState(1)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(3600)
  const [isPaused, setIsPaused] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [resultModal, setResultModal] = useState({ visible: false, score: 0, bandScore: '0', timeSpent: 0 })
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, targetHighlight: null, hasSelection: false, savedRange: null })
  
  const passageRef = useRef(null)
  const answersRef = useRef(answers)
  const timeLeftRef = useRef(timeLeft)

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

  useEffect(() => {
    timeLeftRef.current = timeLeft
  }, [timeLeft])

  useEffect(() => {
    if (isSubmitted || isPaused) return
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          timeLeftRef.current = 0
          handleSubmit()
          return 0
        }
        timeLeftRef.current = prev - 1
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isSubmitted, isPaused])

  const handleAnswerChange = (qNum, val) => {
    if (isSubmitted) return
    setAnswers(prev => {
      const next = { ...prev, [qNum]: val }
      answersRef.current = next
      return next
    })
  }

  const jumpToQuestion = (qNum) => {
    const targetPart = qNum <= 13 ? 1 : qNum <= 26 ? 2 : 3
    if (currentPart !== targetPart) setCurrentPart(targetPart)
    setCurrentQ(qNum)

    setTimeout(() => {
      const el = document.getElementById(`q-${qNum}`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.style.transition = 'background-color 0.5s'
        el.style.backgroundColor = '#fdf2f8'
        setTimeout(() => el.style.backgroundColor = 'transparent', 1500)
      }
    }, 100)
  }

  // --- HIGHLIGHT LOGIC ---
  const handleContextMenu = (e) => {
    e.preventDefault()
    const selection = window.getSelection()
    const hasSelection = selection && selection.toString().trim().length > 0
    let savedRange = null
    if (hasSelection && selection.rangeCount > 0) {
      savedRange = selection.getRangeAt(0).cloneRange()
    }
    const isClickOnHighlight = e.target.closest('span[style*="background-color: yellow"]') || e.target.closest('span.highlighted')

    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetHighlight: isClickOnHighlight,
      hasSelection,
      savedRange
    })
  }

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, visible: false }))
  }

  const handleHighlight = () => {
    const range = contextMenu.savedRange
    if (!range) {
      closeContextMenu()
      return
    }

    const span = document.createElement('span')
    span.style.backgroundColor = 'yellow'
    span.className = 'highlighted'
    
    try {
      range.surroundContents(span)
    } catch (e) {
      const content = range.extractContents()
      span.appendChild(content)
      range.insertNode(span)
    }
    window.getSelection().removeAllRanges()
    closeContextMenu()
  }

  const handleClearHighlight = () => {
    if (contextMenu.targetHighlight) {
      const span = contextMenu.targetHighlight
      const parent = span.parentNode
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span)
      }
      parent.removeChild(span)
    }
    closeContextMenu()
  }

  const handleClearAllHighlights = () => {
    closeContextMenu()
    const highlights = document.querySelectorAll('span.highlighted, span[style*="background-color: yellow"]')
    highlights.forEach(span => {
      const parent = span.parentNode
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span)
      }
      parent.removeChild(span)
    })
  }

  useEffect(() => {
    const handleClick = () => closeContextMenu()
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  // --- PASSAGE HIGHLIGHTING AFTER SUBMIT ---
  const answerHighlights = {
    1: [
      { question: 1, text: "they produce only one baby a year over a reproductive lifespan of about nine years".toLowerCase() },
      { question: 2, text: "To digest their food properly, koalas must sit still for 21 hours every day".toLowerCase() },
      { question: 3, text: "If you upset a koala, it may blink or swallow, or hiccup".toLowerCase() },
      { question: 4, text: "charge visitors to be photographed hugging the furry bundles".toLowerCase() },
      { question: 5, text: "with the aim of instituting national guidelines".toLowerCase() },
      { question: 6, text: "Their problem, however, has been man, more specifically, the white man".toLowerCase() },
      { question: 7, text: "Today koalas are found only in scattered pockets of southeast Australia".toLowerCase() },
      { question: 8, text: "The koalas will be aided by the eucalyptus, which grows quickly and is already burgeoning forth after the fires".toLowerCase() },
      { question: 9, text: "Koalas are just not aggressive".toLowerCase() },
      { question: 10, text: "Koalas are stoic creatures and put on a brave face until they are at death's door".toLowerCase() },
      { question: 11, text: "constant handling can push an already precariously balanced physiology over the edge".toLowerCase() },
      { question: 12, text: "they like to cling on to their handler, all in their own good time and use his or her arm as a tree".toLowerCase() },
      { question: 13, text: "Almost every zoo in Australia has koalas".toLowerCase() }
    ],
    2: [
      { question: 14, text: "ice-choked scenes, similar to those immortalised by the 16th century Flemish painter Pieter Brueghel the Elder, may also return to Europe".toLowerCase() },
      { question: 15, text: "the next cooling trend could drop average temperatures 5 degrees Fahrenheit over much of the United States and 10 degrees in the Northeast, northern Europe, and northern Asia".toLowerCase() },
      { question: 16, text: "During previous cooling periods, whole tribes simply picked up and moved south, but that option doesn't work in the modern, tense world of closed borders".toLowerCase() },
      { question: 17, text: "Because the prevailing North Atlantic winds blow eastward, a lot of the heat wafts to Europe".toLowerCase() },
      { question: 18, text: "And he is alarmed that Americans have yet to take the threat seriously".toLowerCase() },
      { question: 19, text: "A 2002 report titled \"Abrupt Climate Change: Inevitable Surprises\", produced by the National Academy of Sciences, pegged the cost from agricultural losses alone at $100 billion to $250 billion while also predicting that damage to ecologies could be vast and incalculable".toLowerCase() },
      { question: 20, text: "I grew up in Philadelphia. The place in this painting is 30 minutes away by car. I can tell you, this kind of thing just doesn't happen anymore".toLowerCase() },
      { question: 21, text: "he explains how such warming could actually be the surprising culprit of the next mini-ice age".toLowerCase() },
      { question: 22, text: "Bob Dickson, a British oceanographer who sounded an alarm at a February conference in Honolulu".toLowerCase() },
      { question: 23, text: "As it flows northward, the stream surrenders heat to the air".toLowerCase() },
      { question: 24, text: "the now-cooler water becomes denser and sinks into the North Atlantic".toLowerCase() },
      { question: 25, text: "This massive column of cascading cold is the main engine powering a deep-water current called the Great Ocean Conveyor".toLowerCase() },
      { question: 26, text: "But as the North Atlantic fills with fresh water, it grows less dense".toLowerCase() }
    ],
    3: [
      { question: 27, text: "Geoffrey Coates, a chemist at Cornell, has developed a biodegradable plastic synthesized from carbon dioxide and limonene".toLowerCase() },
      { question: 28, text: "The layered structure of a butterfly wing or a peacock plume, which creates iridescent color by refracting light, is being mimicked by cosmetics giant L'Oreal".toLowerCase() },
      { question: 29, text: "Engineers and scientists are now looking at the nasal glands of seabirds to solve the problem of desalination".toLowerCase() },
      { question: 30, text: "DaimlerChrysler, for example, introduced a prototype car modeled on a coral reef fish".toLowerCase() },
      { question: 31, text: "when a company starts seeing itself as an organism in an economic ecosystem".toLowerCase() },
      { question: 32, text: "They determined that the seaweed uses natural chemicals, called furanones, that jam the cell-to-cell signaling systems".toLowerCase() },
      { question: 33, text: "biomimicry is not a new concept (Leonardo da Vinci looked to nature to design his flying machines".toLowerCase() },
      { question: 34, text: "Leonardo da Vinci looked to nature to design his flying machines, for example".toLowerCase() },
      { question: 35, text: "Benyus, who hopes companies will ultimately transcend mere product design to embrace nature on a more holistic level, breaks biomimicry into three tiers".toLowerCase() },
      { question: 36, text: "we can reduce energy consumption by between 30 and 40 percent".toLowerCase() },
      { question: 37, text: "DaimlerChrysler, for example, introduced a prototype car modeled on a coral reef fish".toLowerCase() },
      { question: 38, text: "Companies and communities are flocking to Janine Benyus".toLowerCase() },
      { question: 39, text: "the British paint company Sto has exploited in a line of building paints".toLowerCase() },
      { question: 40, text: "Storm Brewing in Newfoundland, Canada—in one of a growing number of projects around the world applying ZERI principles—is using spent grains".toLowerCase() }
    ]
  }

  const renderParagraph = (text, partNum) => {
    if (!isSubmitted) return text
    let html = text
    const highlights = answerHighlights[partNum] || []
    highlights.forEach(item => {
      const escapeRegExp = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const re = new RegExp(escapeRegExp(item.text), 'i')
      if (re.test(html)) {
         const badge = `<span style="position: absolute; top: -10px; right: -10px; background-color: #2196f3; color: white; border-radius: 50%; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; line-height: 1; z-index: 10; box-shadow: 0 1px 3px rgba(0,0,0,0.3); border: 2px solid white;">${item.question}</span>`
         html = html.replace(re, `<span class="answer-highlight" style="background-color: #ffeb3b; padding: 2px 4px; border-radius: 3px; font-weight: bold; position: relative; color: black; display: inline-block;">$&${badge}</span>`)
      }
    })
    return <span dangerouslySetInnerHTML={{ __html: html }} />
  }
  // -------------------------

  const nextQuestion = () => {
    if (currentQ < 40) jumpToQuestion(currentQ + 1)
  }
  const prevQuestion = () => {
    if (currentQ > 1) jumpToQuestion(currentQ - 1)
  }

  const correctAnswers = {
    1: 'C', 2: 'C', 3: 'A', 4: 'B', 5: 'A',
    6: 'YES', 7: 'NO', 8: 'NO', 9: 'NOT GIVEN', 10: 'YES', 11: 'NOT GIVEN', 12: 'YES', 13: 'A',
    14: 'B', 15: 'C', 16: 'A', 17: 'D', 18: 'B', 19: 'A', 20: 'D', 21: 'C', 22: 'B',
    23: 'water', 24: 'energy', 25: 'forests', 26: 'temperature',
    27: 'B', 28: 'A', 29: 'C', 30: 'B', 31: 'A', 32: 'C',
    33: 'YES', 34: 'NO', 35: 'YES', 36: 'NOT GIVEN', 37: 'NO', 38: 'YES', 39: 'NO', 40: 'YES'
  }

  const isCorrectAnswer = (qNum) => {
    const userAns = (answers[qNum] || '').toString().trim().toUpperCase()
    const correctAns = (correctAnswers[qNum] || '').toString().trim().toUpperCase()
    if (correctAns.includes('/')) return correctAns.split('/').map(s=>s.trim()).includes(userAns)
    return userAns === correctAns
  }

  const handleSubmit = async () => {
    if (isSubmitted) return
    setIsSubmitted(true)
    let correctCount = 0
    for (let i = 1; i <= 40; i++) {
      if (isCorrectAnswer(i)) correctCount++
    }
    const bandScore = calculateReadingBand(correctCount)
    const timeSpent = 3600 - timeLeftRef.current

    await saveTestResult({
      testType: 'reading',
      testId: 'reading-1',
      score: correctCount,
      totalQuestions: 40,
      bandScore,
      timeSpent,
      answers: answersRef.current
    })
    
    setResultModal({ visible: true, score: correctCount, bandScore, timeSpent })
  }

  const currentPassage = ReadingTest1Data.passages[currentPart - 1]
  const currentQuestions = currentPart === 1 
    ? ReadingTest1Data.questions.part1 
    : currentPart === 2 
    ? ReadingTest1Data.questions.part2 
    : ReadingTest1Data.questions.part3

  const [leftWidth, setLeftWidth] = useState(50)
  const isDragging = useRef(false)

  const handleMouseDown = () => { isDragging.current = true }
  const handleMouseUp = () => { isDragging.current = false }
  const handleMouseMove = (e) => {
    if (!isDragging.current) return
    const container = document.getElementById('panels-container')
    if (container) {
      const containerRect = container.getBoundingClientRect()
      const newLeftWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100
      if (newLeftWidth > 20 && newLeftWidth < 80) setLeftWidth(newLeftWidth)
    }
  }

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '16px', lineHeight: 1.4, color: '#333' }}>
      <div className="header" style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '60px', background: '#fff', borderBottom: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 100 }}>
        <div className="timer-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="timer-display" style={{ fontWeight: 'bold', fontSize: '18px', color: timeLeft < 300 ? 'red' : 'black' }}>
            {formatSeconds(timeLeft)}
          </span>
          <div className="timer-controls" style={{ display: 'flex', gap: '5px' }}>
            <button onClick={() => setIsPaused(!isPaused)} id="timer-toggle-btn" title="Pause/Resume Timer" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px"><path d="M0 0h24v24H0V0z" fill="none"/><path d={isPaused ? "M8 5v14l11-7L8 5z" : "M6 19h4V5H6v14zm8-14v14h4V5h-4z"}/></svg>
            </button>
          </div>
        </div>
        <Link to="/dashboard" className="exit-header-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 16px', background: '#FFF0F0', color: '#FF3131', border: '1.5px solid #FF3131', borderRadius: '9999px', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
          ← Bosh sahifaga qaytish
        </Link>
      </div>

      <div className="main-container" id="main-container" onContextMenu={handleContextMenu} style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingTop: '60px', paddingBottom: '80px' }}>
        <div id="passage-header-container" style={{ padding: '10px 20px', background: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <div className="part-header" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p><strong>Part {currentPart}</strong></p>
            <p style={{ margin: 0 }}>Read the text and answer questions {currentPart === 1 ? '1-13' : currentPart === 2 ? '14-26' : '27-40'}.</p>
          </div>
        </div>
        
        <div className="panels-container" id="panels-container" style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Left Panel */}
          <div className="passage-panel" id="passage-panel" ref={passageRef} style={{ width: `${leftWidth}%`, overflowY: 'auto', padding: '20px' }}>
            <div className="reading-passage">
              <h4 className="text-center" style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '20px', marginBottom: '15px' }}>{currentPassage.title}</h4>
              {currentPassage.content.map((paragraph, i) => (
                <p key={i} style={{ marginBottom: '1.2em' }}>
                  {renderParagraph(paragraph, currentPart)}
                </p>
              ))}
            </div>
          </div>
          
          <div className="resizer" id="resizer" onMouseDown={handleMouseDown} style={{ width: '10px', cursor: 'col-resize', backgroundColor: '#f0f0f0', backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2710%27 height=%2730%27 viewBox=%270 0 10 30%27%3E%3Cpath d=%27M4 11h2v2H4zM4 15h2v2H4zM4 19h2v2H4z%27 fill=%27%23888%27/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', flexShrink: 0 }}></div>
          
          {/* Right Panel */}
          <div className="questions-panel" id="questions-panel" style={{ width: `${100 - leftWidth}%`, overflowY: 'auto', padding: '20px', borderLeft: '1px solid #e0e0e0' }}>
            <div className="question-set">
              {currentQuestions.map(item => {
                const isCorrect = isSubmitted ? isCorrectAnswer(item.id) : null
                const userAnswer = answers[item.id]
                const correctAns = correctAnswers[item.id]

                return (
                  <div key={item.id} id={`q-${item.id}`} style={{ marginBottom: '30px' }}>
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                      <span className="question-number" style={{ background: 'white', border: '1px solid #FF3131', padding: '4px 8px', borderRadius: '3px', fontWeight: 'bold', fontSize: '14px', color: '#FF3131', minWidth: '30px', textAlign: 'center', height: 'max-content' }}>
                        {item.id}
                      </span>
                      <div>
                        <span className="tf-question-text" style={{ fontSize: '16px' }}>{item.prompt}</span>
                        {isSubmitted && !isCorrect && (
                          <div style={{ marginTop: '5px', color: '#28a745', fontWeight: 'bold', fontSize: '14px' }}>
                            ➜ Correct Answer: {correctAns}
                          </div>
                        )}
                      </div>
                    </div>

                    {item.type === 'mcq' && item.options && (
                      <div className="tf-options" style={{ marginLeft: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {item.options.map((optText, i) => {
                          const letter = String.fromCharCode(65 + i)
                          const isChecked = userAnswer === letter
                          return (
                            <label key={letter} className="tf-option" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: isSubmitted ? 'not-allowed' : 'pointer' }}>
                              <input 
                                type="radio" 
                                name={`q-${item.id}`} 
                                value={letter} 
                                checked={isChecked} 
                                onChange={() => handleAnswerChange(item.id, letter)} 
                                disabled={isSubmitted} 
                              /> 
                              {optText}
                            </label>
                          )
                        })}
                      </div>
                    )}

                    {item.type === 'tfng' && (
                      <div className="tf-options" style={{ marginLeft: '40px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {['YES', 'NO', 'NOT GIVEN'].map(opt => {
                          const isChecked = userAnswer === opt
                          return (
                            <label key={opt} className="tf-option" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: isSubmitted ? 'not-allowed' : 'pointer' }}>
                              <input 
                                type="radio" 
                                name={`q-${item.id}`} 
                                value={opt} 
                                checked={isChecked} 
                                onChange={() => handleAnswerChange(item.id, opt)} 
                                disabled={isSubmitted} 
                              /> 
                              {opt}
                            </label>
                          )
                        })}
                      </div>
                    )}

                    {(item.type === 'matrix' || item.type === 'matrix3') && (
                      <div className="tf-options" style={{ marginLeft: '40px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {(item.people || item.levels || ['A', 'B', 'C', 'D', 'E', 'F']).map(opt => {
                          const letter = opt.charAt(0)
                          const isChecked = userAnswer === letter
                          return (
                            <label key={letter} className="tf-option" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: isSubmitted ? 'not-allowed' : 'pointer', padding: '5px 10px', border: '1px solid #ccc', borderRadius: '4px', background: isChecked ? '#e9ecef' : 'white' }}>
                              <input 
                                type="radio" 
                                name={`q-${item.id}`} 
                                value={letter} 
                                checked={isChecked} 
                                onChange={() => handleAnswerChange(item.id, letter)} 
                                disabled={isSubmitted} 
                                style={{ display: 'none' }}
                              /> 
                              {opt}
                            </label>
                          )
                        })}
                      </div>
                    )}

                    {item.type === 'gap' && (
                      <div style={{ marginLeft: '40px' }}>
                        <input
                          type="text"
                          value={userAnswer || ''}
                          onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                          disabled={isSubmitted}
                          style={{ padding: '6px 12px', border: '1px solid #ccc', borderRadius: '4px', width: '200px', fontSize: '14px' }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="nav-arrows" style={{ position: 'fixed', bottom: '100px', right: '20px', display: 'flex', gap: '6px', zIndex: 101 }}>
        <button className="nav-arrow prev" onClick={prevQuestion} disabled={currentQ <= 1} style={{ width: '48px', height: '48px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: '#fff', backgroundColor: '#4b5563', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.25)', opacity: currentQ <= 1 ? 0.5 : 1 }}>❮</button>
        <button className="nav-arrow next" onClick={nextQuestion} disabled={currentQ >= 40} style={{ width: '48px', height: '48px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: '#fff', backgroundColor: '#000000', borderRadius: '4px', boxShadow: '0 2px 6px rgba(0,0,0,0.25)', opacity: currentQ >= 40 ? 0.5 : 1 }}>❯</button>
      </div>

      <div className="nav-row" style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#ffffff', display: 'flex', alignItems: 'center', height: '80px', zIndex: 100, borderTop: '1px solid #e0e0e0', paddingRight: '20px' }}>
        <div style={{ display: 'flex', flex: 1, alignItems: 'center', paddingLeft: '20px' }}>
          {[1, 2, 3].map(part => {
            const isActive = currentPart === part
            const pStart = part === 1 ? 1 : part === 2 ? 14 : 27
            const pEnd = part === 1 ? 13 : part === 2 ? 26 : 40
            let answeredCount = 0
            for(let i=pStart; i<=pEnd; i++){ if(answers[i] !== undefined && answers[i] !== '') answeredCount++ }

            return (
              <div key={part} className={`footer__questionWrapper___1tZ46 ${isActive ? 'selected' : ''}`} style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
                <button 
                  className="footer__questionNo___3WNct" 
                  onClick={() => setCurrentPart(part)}
                  style={{ background: 'none', border: 'none', padding: '10px 15px', fontSize: '16px', fontWeight: 600, color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <span className="section-prefix">Part</span><span className="sectionNr">{part}</span>
                  {!isActive && <span className="attemptedCount" style={{ fontSize: '14px', color: '#666', marginLeft: '5px', fontWeight: 400 }}>{answeredCount} of {pEnd - pStart + 1}</span>}
                </button>
                
                {isActive && (
                  <div className="footer__subquestionWrapper___9GgoP" style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginLeft: '10px', maxWidth: '600px' }}>
                    {Array.from({ length: pEnd - pStart + 1 }).map((_, i) => {
                      const q = pStart + i
                      const isAnswered = answers[q] !== undefined && answers[q] !== ''
                      const isCorrect = isSubmitted ? isCorrectAnswer(q) : null

                      let subQClass = 'subQuestion'
                      if (isSubmitted) {
                        subQClass += isCorrect ? ' correct' : ' incorrect'
                      } else if (currentQ === q) {
                        subQClass += ' active'
                      } else if (isAnswered) {
                        subQClass += ' answered'
                      }

                      let bg = 'white'
                      let col = '#333'
                      let bdr = '#ccc'
                      if (isSubmitted) {
                        bg = isCorrect ? '#28a745' : '#dc3545'
                        col = 'white'
                        bdr = bg
                      } else if (currentQ === q) {
                        bg = '#FF3131'
                        col = 'white'
                        bdr = '#FF3131'
                      } else if (isAnswered) {
                        bg = '#e9ecef'
                        bdr = '#ddd'
                      }

                      return (
                        <button 
                          key={q} 
                          className={subQClass} 
                          onClick={() => jumpToQuestion(q)}
                          style={{ width: '32px', height: '32px', border: `1px solid ${bdr}`, background: bg, color: col, fontSize: '14px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '2px' }}
                        >
                          {q}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
        <button className="help-button" onClick={handleSubmit} disabled={isSubmitted} style={{ background: '#FF3131', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: isSubmitted ? 0.5 : 1 }}>
          Check Answers
        </button>
      </div>

      {contextMenu.visible && (
        <div 
          className="context-menu" 
          style={{ 
            position: 'fixed', 
            left: contextMenu.x, 
            top: contextMenu.y, 
            display: 'block', 
            background: 'white', 
            border: '1px solid #ccc', 
            boxShadow: '2px 2px 5px rgba(0,0,0,0.2)', 
            zIndex: 1000, 
            padding: '5px 0', 
            minWidth: '150px' 
          }}
        >
          <div 
            className="context-menu-item" 
            onMouseDown={(e) => { e.preventDefault(); handleHighlight(); }}
            style={{ padding: '8px 15px', cursor: 'pointer', color: contextMenu.hasSelection ? '#333' : '#aaa' }}
          >
            Highlight
          </div>
          <div 
            className="context-menu-item" 
            onMouseDown={(e) => { e.preventDefault(); handleClearHighlight(); }}
            style={{ padding: '8px 15px', cursor: 'pointer', color: contextMenu.targetHighlight ? '#333' : '#aaa' }}
          >
            Clear Highlight
          </div>
          <div 
            className="context-menu-item" 
            onMouseDown={(e) => { e.preventDefault(); handleClearAllHighlights(); }}
            style={{ padding: '8px 15px', cursor: 'pointer', color: '#333' }}
          >
            Clear All
          </div>
        </div>
      )}

      {/* CUSTOM RESULT POPUP */}
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
