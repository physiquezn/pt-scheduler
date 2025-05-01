
function parseTimeRange(str) {
  if (!str) return [];
  if (str.includes('-') || str.includes('~')) {
    const [start, end] = str.split(/-|~/).map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  return [Number(str)];
}

function parseTimeRange(str) {
  if (!str) return [];
  if (str.includes('-') || str.includes('~')) {
    const [start, end] = str.split(/-|~/).map(Number);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  return [Number(str)];
}

function preprocessTimeBlocks(rawString) {
  const tokens = rawString.split(',');
  const result = [];
  let currentDays = [];

  tokens.forEach(token => {
    const trimmed = token.trim();
    const comboMatch = trimmed.match(/^([월화수목금]+)\s*(\d+(?:[-~]\d+)?)$/);
    const dayMatch = trimmed.match(/^[월화수목금]+$/);
    const timeMatch = trimmed.match(/^\d+(?:[-~]\d+)?$/);

    if (comboMatch) {
      const days = comboMatch[1].split('');
      const time = comboMatch[2];
      days.forEach(day => result.push(`${day} ${time}`));
      currentDays = [];
    } else if (dayMatch) {
      const days = trimmed.split('').filter(d => '월화수목금'.includes(d));
      currentDays = [...new Set([...currentDays, ...days])]; // 누적 유지
    } else if (timeMatch && currentDays.length > 0) {
      currentDays.forEach(day => result.push(`${day} ${trimmed}`));
      currentDays = [];
    }
  });

  return result;
}

// (Other logic remains the same as in v39)
  });

  return result;
}

function parseBlockedTimes(blockedText) {
  const entries = blockedText.split(',').map(e => e.trim());
  const blocked = [];
  entries.forEach(entry => {
    const match = entry.match(/^([월화수목금])\s*(\d+(?:[-~]\d+)?)$/);
    if (match) {
      const day = match[1];
      const times = parseTimeRange(match[2]);
      times.forEach(hour => blocked.push({ day, hour }));
    }
  });
  return blocked;
}

function parseInput(input) {
  const lines = input.trim().split('\n');
  return lines.map(line => {
    const [nameRaw, countRawRaw, ...timeRawParts] = line.split('/').map(s => s.trim());
    const count = parseInt(countRawRaw.replace(/[^0-9]/g, ''), 10);
    const availability = {};

    const preprocessed = preprocessTimeBlocks(timeRawParts.join(','));
    preprocessed.forEach(item => {
      const [day, time] = item.split(' ');
      if (!availability[day]) availability[day] = [];
      availability[day].push(...parseTimeRange(time));
    });

    return { name: nameRaw, count, availability };
  });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function generateSchedule() {
  const output = document.getElementById('output');
  output.innerHTML = '<div style="color: yellow; font-weight: bold;">[main.js 호출됨 - V39 패치 반영]</div>';

  console.log("[V39] generateSchedule called");
  const days = ['월', '화', '수', '목', '금'];
  const hours = Array.from({ length: 9 }, (_, i) => 14 + i);
  const inputText = document.getElementById('input').value;
  const blockedText = document.getElementById('blocked').value;
  const blockedSlots = parseBlockedTimes(blockedText);
  const requests = parseInput(inputText);
  const schedule = {};
  const resultMap = {};

  days.forEach(day => {
    schedule[day] = {};
    hours.forEach(hour => {
      schedule[day][hour] = null;
    });
  });

  shuffleArray(requests);

  const sorted = [...requests].sort((a, b) => {
    const aOptions = Object.values(a.availability).reduce((sum, v) => sum + v.length, 0);
    const bOptions = Object.values(b.availability).reduce((sum, v) => sum + v.length, 0);
    return aOptions - bOptions;
  });

  sorted.forEach(req => {
    resultMap[req.name] = [];
    let count = 0;
    const usedDaySet = new Set();
    const allSlots = [];

    for (const day of days) {
      if (!req.availability[day]) continue;
      req.availability[day].forEach(hour => {
        allSlots.push({ day, hour });
      });
    }

    shuffleArray(allSlots);

    for (const slot of allSlots) {
      const { day, hour } = slot;
      const isBlocked = blockedSlots.some(b => b.day === day && b.hour === hour);
      if (schedule[day][hour] === null && !usedDaySet.has(day) && !isBlocked) {
        schedule[day][hour] = req.name;
        resultMap[req.name].push(`${day} ${hour.toString().padStart(2, "0")}:00`);
        usedDaySet.add(day);
        count++;
        if (count >= req.count) break;
      }
    }
  });

  let output = '<h3>🗓️ 배정 요약</h3><ul>';
  for (const name in resultMap) {
    output += `<li>${name}: ${resultMap[name].length}회 (${resultMap[name].join(', ')})</li>`;
  }
  output += '</ul>';
  let totalCount = Object.values(resultMap).reduce((sum, arr) => sum + arr.length, 0);
  output += `<h3>📊 총 수업 수: ${totalCount}개</h3>`;
  output += '<h3>📅 시간표</h3>';
  output += '<div style="overflow-x:auto"><table><thead><tr><th>시간</th>' + days.map(d => `<th>${d}</th>`).join('') + '</tr></thead><tbody>';
  hours.forEach(hour => {
    output += `<tr><td>${hour.toString().padStart(2, "0")}:00</td>`;
    days.forEach(day => {
      const assigned = schedule[day][hour];
      output += `<td class="${assigned ? 'highlight' : ''}">${assigned || '-'}</td>`;
    });
    output += '</tr>';
  });
  output += '</tbody></table></div>';
  document.getElementById('output').innerHTML = output;
}

window.generateSchedule = generateSchedule;
window.onerror = function(msg) {
  const output = document.getElementById('output');
  output.innerHTML = '<div style="color: red;">[V39 오류] ' + msg + '</div>';
};
