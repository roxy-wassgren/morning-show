const showData = [
  {
    season: 1,
    episodes: [
      {
        id: "s1e1",
        number: 1,
        title: "Episode 1",
        blurb:
          "The broadcast machine cracks open as the team scrambles to control the story before the story controls them.",
        focus: "Shock, image management, and who gets to stay in frame.",
        prompt: "Did the pilot make you sympathize more with the anchors or the producers?"
      },
      {
        id: "s1e2",
        number: 2,
        title: "Episode 2",
        blurb:
          "A new on-air dynamic begins to take shape while private agendas collide behind closed studio doors.",
        focus: "Chemistry, leverage, and newsroom positioning.",
        prompt: "Which character adapted fastest once the balance of power started moving?"
      },
      {
        id: "s1e3",
        number: 3,
        title: "Episode 3",
        blurb:
          "Public narratives tighten, internal loyalties crack, and every meeting feels like damage control.",
        focus: "Narrative spin and the cost of institutional self-protection.",
        prompt: "Who felt most honest in this episode, and who felt most strategic?"
      }
    ]
  },
  {
    season: 2,
    episodes: [
      {
        id: "s2e1",
        number: 1,
        title: "Episode 1",
        blurb:
          "The team tries to look forward while old decisions keep reappearing in fresh ways.",
        focus: "Reinvention, fallout, and the limits of rebranding.",
        prompt: "Did the season reset feel earned, or did the past still dominate every scene?"
      },
      {
        id: "s2e2",
        number: 2,
        title: "Episode 2",
        blurb:
          "Professional ambition and personal insecurity begin pulling the newsroom in different directions.",
        focus: "Control versus vulnerability.",
        prompt: "Which relationship felt most unstable by the end of the episode?"
      },
      {
        id: "s2e3",
        number: 3,
        title: "Episode 3",
        blurb:
          "Private secrets reshape public decisions as the pressure of appearing calm becomes impossible to sustain.",
        focus: "Exposure and emotional containment.",
        prompt: "Who is managing perception best, and who is losing grip on it?"
      }
    ]
  },
  {
    season: 3,
    episodes: [
      {
        id: "s3e1",
        number: 1,
        title: "Episode 1",
        blurb:
          "A new phase of expansion raises the stakes, turning strategy meetings into battles over identity and ownership.",
        focus: "Scale, ambition, and public credibility.",
        prompt: "Did the larger corporate angle make the show stronger or more distant?"
      },
      {
        id: "s3e2",
        number: 2,
        title: "Episode 2",
        blurb:
          "Off-camera negotiations start shaping what viewers eventually see on camera.",
        focus: "Power structures that hide behind polished television.",
        prompt: "Which character seemed best at reading the room before everyone else?"
      },
      {
        id: "s3e3",
        number: 3,
        title: "Episode 3",
        blurb:
          "The façade of control looks more fragile as competition, fear, and loyalty collide in real time.",
        focus: "Performance under pressure.",
        prompt: "Who looked strongest in public but weakest in private?"
      }
    ]
  },
  {
    season: 4,
    episodes: [
      {
        id: "s4e1",
        number: 1,
        title: "Episode 1",
        blurb:
          "The latest season opens with a sharper sense of consequence, where every public move invites a private reckoning.",
        focus: "Legacy, image, and shifting alliances.",
        prompt: "Did the new season start with enough urgency to reset the stakes?"
      },
      {
        id: "s4e2",
        number: 2,
        title: "Episode 2",
        blurb:
          "Newsroom urgency turns personal as competing priorities blur the line between duty and self-preservation.",
        focus: "Motive, momentum, and internal fracture.",
        prompt: "Which subplot feels most likely to reshape the season?"
      },
      {
        id: "s4e3",
        number: 3,
        title: "Episode 3",
        blurb:
          "The pressure of staying relevant becomes just as dangerous as the pressure of telling the truth.",
        focus: "Truth, spectacle, and survival.",
        prompt: "What do you think the show is saying about modern media now?"
      }
    ]
  }
];

const storageKey = "morning-show-comments";
const seasonTabs = document.getElementById("season-tabs");
const episodeList = document.getElementById("episode-list");
const seasonSummary = document.getElementById("season-summary");
const episodeTitle = document.getElementById("episode-title");
const episodeMeta = document.getElementById("episode-meta");
const episodeBlurb = document.getElementById("episode-blurb");
const episodeFocus = document.getElementById("episode-focus");
const episodePrompt = document.getElementById("episode-prompt");
const commentTarget = document.getElementById("comment-target");
const commentCount = document.getElementById("comment-count");
const commentList = document.getElementById("comment-list");
const commentForm = document.getElementById("comment-form");
const commentName = document.getElementById("comment-name");
const commentText = document.getElementById("comment-text");

let activeSeason = showData[0].season;
let activeEpisodeId = showData[0].episodes[0].id;

function loadComments() {
  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    return {};
  }
}

function saveComments(commentMap) {
  window.localStorage.setItem(storageKey, JSON.stringify(commentMap));
}

function getActiveSeasonData() {
  return showData.find((season) => season.season === activeSeason);
}

function getActiveEpisode() {
  return showData
    .flatMap((season) => season.episodes)
    .find((episode) => episode.id === activeEpisodeId);
}

function formatSeasonLabel(seasonNumber, episodeNumber) {
  return `Season ${seasonNumber}, Episode ${episodeNumber}`;
}

function renderSeasonTabs() {
  seasonTabs.innerHTML = "";

  showData.forEach((season) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "season-tab";
    button.textContent = `Season ${season.season}`;

    if (season.season === activeSeason) {
      button.classList.add("active");
    }

    button.addEventListener("click", () => {
      activeSeason = season.season;
      activeEpisodeId = season.episodes[0].id;
      render();
    });

    seasonTabs.appendChild(button);
  });
}

function renderEpisodeList() {
  const season = getActiveSeasonData();
  seasonSummary.textContent = `${season.episodes.length} episodes in view`;
  episodeList.innerHTML = "";

  season.episodes.forEach((episode) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "episode-card";

    if (episode.id === activeEpisodeId) {
      button.classList.add("active");
    }

    button.innerHTML = `
      <small>${formatSeasonLabel(season.season, episode.number)}</small>
      <strong>${episode.title}</strong>
      <span>${episode.focus}</span>
    `;

    button.addEventListener("click", () => {
      activeEpisodeId = episode.id;
      renderEpisodeDetail();
      renderComments();
    });

    episodeList.appendChild(button);
  });
}

function renderEpisodeDetail() {
  const season = getActiveSeasonData();
  const episode = getActiveEpisode();

  episodeTitle.textContent = episode.title;
  episodeMeta.textContent = formatSeasonLabel(season.season, episode.number);
  episodeBlurb.textContent = episode.blurb;
  episodeFocus.textContent = episode.focus;
  episodePrompt.textContent = episode.prompt;
  commentTarget.textContent = `Posting to: ${formatSeasonLabel(
    season.season,
    episode.number
  )}`;
}

function renderComments() {
  const commentMap = loadComments();
  const comments = commentMap[activeEpisodeId] || [];
  commentCount.textContent = `${comments.length} ${
    comments.length === 1 ? "post" : "posts"
  }`;
  commentList.innerHTML = "";

  if (!comments.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent =
      "No comments yet for this episode. Start the discussion.";
    commentList.appendChild(empty);
    return;
  }

  comments
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .forEach((comment) => {
      const card = document.createElement("article");
      card.className = "comment-card";

      const header = document.createElement("header");
      const author = document.createElement("strong");
      const time = document.createElement("time");
      const text = document.createElement("p");

      author.textContent = comment.name;
      time.textContent = new Date(comment.createdAt).toLocaleString();
      text.textContent = comment.text;

      header.append(author, time);
      card.append(header, text);
      commentList.appendChild(card);
    });
}

function render() {
  renderSeasonTabs();
  renderEpisodeList();
  renderEpisodeDetail();
  renderComments();
}

commentForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = commentName.value.trim();
  const text = commentText.value.trim();

  if (!name || !text) {
    return;
  }

  const commentMap = loadComments();
  const episodeComments = commentMap[activeEpisodeId] || [];

  episodeComments.push({
    id: crypto.randomUUID(),
    name,
    text,
    createdAt: new Date().toISOString()
  });

  commentMap[activeEpisodeId] = episodeComments;
  saveComments(commentMap);

  commentForm.reset();
  renderComments();
  commentName.focus();
});

render();
