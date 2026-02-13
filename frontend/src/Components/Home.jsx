import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Home = () => {
  const navigate = useNavigate();
  const lastScrollY = useRef(0);
  const [showHeader, setShowHeader] = useState(true);
  const [user, setUser] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [challenges, setChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [dailyFeeling, setDailyFeeling] = useState(null);
  const [canAnswerFeeling, setCanAnswerFeeling] = useState(true);
  const [feelingsHistory, setFeelingsHistory] = useState([]);
  const [lifetimeCompleted, setLifetimeCompleted] = useState(0);
  const [lastResetDate, setLastResetDate] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY < 80) {
        setShowHeader(true);
      } else if (currentScrollY > lastScrollY.current) {
        setShowHeader(false);
      } else {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      loadUserData(parsedUser);
      fetchLifetimeCompleted(parsedUser.id);
    }
  }, []);

  const getBelgradeDate = () => {
    const now = new Date();
    const belgradeTime = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Belgrade" }));
    return belgradeTime.toISOString().split('T')[0];
  };

  const fetchLifetimeCompleted = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/users/${userId}/lifetime-completed`);
      setLifetimeCompleted(response.data.lifetimeCompleted || 0);
    } catch (error) {
      console.error("Error fetching lifetime completed:", error);
    }
  };

  const updateLifetimeCompleted = async (userId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/users/${userId}/increment-lifetime`);
      setLifetimeCompleted(response.data.lifetimeCompleted);
    } catch (error) {
      console.error("Error updating lifetime completed:", error);
    }
  };

  const loadUserData = (userData) => {
    const today = getBelgradeDate();
    const storedChallenges = localStorage.getItem(`challenges_${userData.id}`);
    const storedDate = localStorage.getItem(`challengesDate_${userData.id}`);
    const storedCompleted = localStorage.getItem(`completed_${userData.id}`);
    const storedFeelings = localStorage.getItem(`feelings_${userData.id}`);
    const lastFeelingTime = localStorage.getItem(`lastFeeling_${userData.id}`);

    if (storedDate !== today || !storedChallenges) {
      const newChallenges = generateChallenges(userData);
      setChallenges(newChallenges);
      localStorage.setItem(`challenges_${userData.id}`, JSON.stringify(newChallenges));
      localStorage.setItem(`challengesDate_${userData.id}`, today);
      localStorage.setItem(`completed_${userData.id}`, JSON.stringify([]));
      setCompletedChallenges([]);
    } else {
      setChallenges(JSON.parse(storedChallenges));
      if (storedCompleted) {
        setCompletedChallenges(JSON.parse(storedCompleted));
      }
    }

    if (storedFeelings) {
      setFeelingsHistory(JSON.parse(storedFeelings));
    }

    if (lastFeelingTime) {
      const timeDiff = Date.now() - parseInt(lastFeelingTime);
      if (timeDiff < 86400000) {
        setCanAnswerFeeling(false);
      }
    }

    setLastResetDate(today);
  };

  const generateChallenges = (userData) => {
    const gender = userData.gender || "neutral";
    const occupation = userData.occupation || "student";
    const anxietyLevel = userData.anxietyLevel || 5;

    const challengePool = {
      student: {
        male: {
          low: [
            "Pozdravi 5 novih kolega danas",
            "Organizuj grupu za učenje",
            "Vodi prezentaciju pred razredom",
            "Započni razgovor sa profesorom nakon časa",
            "Pridruži se novom klubu ili aktivnosti",
            "Predloži projekat grupi",
            "Pozovi kolege na kafu posle predavanja",
            "Predstavi se nekome ko ti se čini interesantnim"
          ],
          medium: [
            "Pozdravi 3 nova kolegu danas",
            "Postavi jedno pitanje na času",
            "Sedni pored nekoga novog u menzi",
            "Pridruži se grupi koja razgovara na pauzi",
            "Komplimenraj nekome danas",
            "Razmeni kontakt sa nekim novim",
            "Učestvuj u diskusiji na času"
          ],
          high: [
            "Pozdravi jednog kolegu danas",
            "Nasmeši se nekome u hodniku",
            "Odgovori na jedno pitanje u grupi na WhatsAppu",
            "Sedni u razredu pored nekoga",
            "Kaži 'dobar dan' profesoru"
          ]
        },
        female: {
          low: [
            "Pozdravi 5 novih koleginica danas",
            "Organizuj grupu za učenje",
            "Vodi prezentaciju pred razredom",
            "Započni razgovor sa profesorkom nakon časa",
            "Pridruži se novom klubu ili aktivnosti",
            "Predloži projekat grupi",
            "Pozovi koleginice na kafu posle predavanja",
            "Predstavi se nekome ko ti se čini interesantnim"
          ],
          medium: [
            "Pozdravi 3 nove koleginice danas",
            "Postavi jedno pitanje na času",
            "Sedni pored nekoga novog u menzi",
            "Pridruži se grupi koja razgovara na pauzi",
            "Komplimenraj nekome danas",
            "Razmeni kontakt sa nekim novim",
            "Učestvuj u diskusiji na času"
          ],
          high: [
            "Pozdravi jednu koleginicu danas",
            "Nasmeši se nekome u hodniku",
            "Odgovori na jedno pitanje u grupi na WhatsAppu",
            "Sedni u razredu pored nekoga",
            "Kaži 'dobar dan' profesorki"
          ]
        },
        neutral: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Organizuj grupu za učenje",
            "Vodi prezentaciju pred razredom",
            "Započni razgovor sa profesorom nakon časa",
            "Pridruži se novom klubu ili aktivnosti",
            "Predloži projekat grupi",
            "Pozovi kolege na kafu posle predavanja",
            "Predstavi se nekome ko ti se čini interesantnim"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Postavi jedno pitanje na času",
            "Sedni pored nekoga novog u menzi",
            "Pridruži se grupi koja razgovara na pauzi",
            "Komplimenraj nekome danas",
            "Razmeni kontakt sa nekim novim",
            "Učestvuj u diskusiji na času"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome u hodniku",
            "Odgovori na jedno pitanje u grupi na WhatsAppu",
            "Sedni u razredu pored nekoga",
            "Kaži 'dobar dan' profesoru"
          ]
        }
      },
      worker: {
        male: {
          low: [
            "Pozdravi 5 novih kolega danas",
            "Predloži jednu ideju na sastanku",
            "Organizuj team building",
            "Vodi prezentaciju pred timom",
            "Pozovi kolege na ručak",
            "Započni razgovor sa menadžerom",
            "Umreži se sa nekim iz drugog odeljenja",
            "Predloži inovaciju u procesu"
          ],
          medium: [
            "Pozdravi 3 nova kolegu danas",
            "Postavi pitanje na sastanku",
            "Pozovi kolegu na kafu",
            "Započni razgovor sa nekim iz drugog tima",
            "Ponudi pomoć kolegi",
            "Podeli svoju ideju sa timom",
            "Razmeni mišljenje o projektu"
          ],
          high: [
            "Pozdravi jednog kolegu danas",
            "Nasmeši se kolegi u hodniku",
            "Odgovori na email brzo",
            "Kaži 'dobar dan' na sastanku",
            "Poslušaj tuđe mišljenje bez komentara"
          ]
        },
        female: {
          low: [
            "Pozdravi 5 novih koleginica danas",
            "Predloži jednu ideju na sastanku",
            "Organizuj team building",
            "Vodi prezentaciju pred timom",
            "Pozovi koleginice na ručak",
            "Započni razgovor sa menadžerkom",
            "Umreži se sa nekim iz drugog odeljenja",
            "Predloži inovaciju u procesu"
          ],
          medium: [
            "Pozdravi 3 nove koleginice danas",
            "Postavi pitanje na sastanku",
            "Pozovi koleginicu na kafu",
            "Započni razgovor sa nekim iz drugog tima",
            "Ponudi pomoć koleginici",
            "Podeli svoju ideju sa timom",
            "Razmeni mišljenje o projektu"
          ],
          high: [
            "Pozdravi jednu koleginicu danas",
            "Nasmeši se koleginici u hodniku",
            "Odgovori na email brzo",
            "Kaži 'dobar dan' na sastanku",
            "Poslušaj tuđe mišljenje bez komentara"
          ]
        },
        neutral: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Predloži jednu ideju na sastanku",
            "Organizuj team building",
            "Vodi prezentaciju pred timom",
            "Pozovi kolege na ručak",
            "Započni razgovor sa menadžerom",
            "Umreži se sa nekim iz drugog odeljenja",
            "Predloži inovaciju u procesu"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Postavi pitanje na sastanku",
            "Pozovi kolegu na kafu",
            "Započni razgovor sa nekim iz drugog tima",
            "Ponudi pomoć kolegi",
            "Podeli svoju ideju sa timom",
            "Razmeni mišljenje o projektu"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se kolegi u hodniku",
            "Odgovori na email brzo",
            "Kaži 'dobar dan' na sastanku",
            "Poslušaj tuđe mišljenje bez komentara"
          ]
        }
      },
      unemployed: {
        male: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Razgovaraj sa nekim u redu 5 minuta",
            "Pozovi prijatelja na kafu",
            "Pridruži se lokalnoj grupi ili aktivnosti",
            "Započni razgovor u teretani/parku",
            "Upoznaj komšiju",
            "Idi na networking događaj"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni razgovor sa nekim u redu",
            "Komplimenraj nekome danas",
            "Pozovi prijatelja na šetnju",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni mali razgovor sa strancem"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome na ulici",
            "Kaži 'dobar dan' komšiji",
            "Odgovori na poruku prijatelja",
            "Izađi napolje na 10 minuta"
          ]
        },
        female: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Razgovaraj sa nekim u redu 5 minuta",
            "Pozovi prijateljicu na kafu",
            "Pridruži se lokalnoj grupi ili aktivnosti",
            "Započni razgovor u teretani/parku",
            "Upoznaj komšinicu",
            "Idi na networking događaj"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni razgovor sa nekim u redu",
            "Komplimenraj nekome danas",
            "Pozovi prijateljicu na šetnju",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni mali razgovor sa strancem"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome na ulici",
            "Kaži 'dobar dan' komšinici",
            "Odgovori na poruku prijateljice",
            "Izađi napolje na 10 minuta"
          ]
        },
        neutral: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Razgovaraj sa nekim u redu 5 minuta",
            "Pozovi prijatelja na kafu",
            "Pridruži se lokalnoj grupi ili aktivnosti",
            "Započni razgovor u teretani/parku",
            "Upoznaj komšiju",
            "Idi na networking događaj"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni razgovor sa nekim u redu",
            "Komplimenraj nekome danas",
            "Pozovi prijatelja na šetnju",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni mali razgovor sa strancem"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome na ulici",
            "Kaži 'dobar dan' komšiji",
            "Odgovori na poruku prijatelja",
            "Izađi napolje na 10 minuta"
          ]
        }
      },
      entrepreneur: {
        male: {
          low: [
            "Kontaktiraj 5 potencijalnih klijenata",
            "Vodi prezentaciju pred investitorima",
            "Organizuj networking događaj",
            "Pozovi poslovnog partnera na ručak",
            "Podeli svoju viziju javno",
            "Započni saradnju sa nekim novim",
            "Prisustvuj poslovnoj konferenciji"
          ],
          medium: [
            "Kontaktiraj 2 potencijalna klijenta",
            "Podeli svoju ideju sa nekim novim",
            "Umreži se sa nekim iz tvoje industrije",
            "Zatraži feedback od nekoga",
            "Pozovi poslovnog partnera na kafu",
            "Predstavi se potencijalnom klijentu",
            "Podeli svoj biznis na društvenim mrežama"
          ],
          high: [
            "Kontaktiraj jednog potencijalnog klijenta",
            "Odgovori na poslovni email",
            "Podeli jedan post o svom biznisu",
            "Razgovaraj sa jednim klijentom",
            "Zatraži savet od mentora"
          ]
        },
        female: {
          low: [
            "Kontaktiraj 5 potencijalnih klijenata",
            "Vodi prezentaciju pred investitorima",
            "Organizuj networking događaj",
            "Pozovi poslovnu partnerku na ručak",
            "Podeli svoju viziju javno",
            "Započni saradnju sa nekim novim",
            "Prisustvuj poslovnoj konferenciji"
          ],
          medium: [
            "Kontaktiraj 2 potencijalna klijenta",
            "Podeli svoju ideju sa nekim novim",
            "Umreži se sa nekim iz tvoje industrije",
            "Zatraži feedback od nekoga",
            "Pozovi poslovnu partnerku na kafu",
            "Predstavi se potencijalnom klijentu",
            "Podeli svoj biznis na društvenim mrežama"
          ],
          high: [
            "Kontaktiraj jednog potencijalnog klijenta",
            "Odgovori na poslovni email",
            "Podeli jedan post o svom biznisu",
            "Razgovaraj sa jednim klijentom",
            "Zatraži savet od mentorice"
          ]
        },
        neutral: {
          low: [
            "Kontaktiraj 5 potencijalnih klijenata",
            "Vodi prezentaciju pred investitorima",
            "Organizuj networking događaj",
            "Pozovi poslovnog partnera na ručak",
            "Podeli svoju viziju javno",
            "Započni saradnju sa nekim novim",
            "Prisustvuj poslovnoj konferenciji"
          ],
          medium: [
            "Kontaktiraj 2 potencijalna klijenta",
            "Podeli svoju ideju sa nekim novim",
            "Umreži se sa nekim iz tvoje industrije",
            "Zatraži feedback od nekoga",
            "Pozovi poslovnog partnera na kafu",
            "Predstavi se potencijalnom klijentu",
            "Podeli svoj biznis na društvenim mrežama"
          ],
          high: [
            "Kontaktiraj jednog potencijalnog klijenta",
            "Odgovori na poslovni email",
            "Podeli jedan post o svom biznisu",
            "Razgovaraj sa jednim klijentom",
            "Zatraži savet od mentora"
          ]
        }
      },
      other: {
        male: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Započni razgovor sa nekim novim",
            "Pozovi prijatelja na aktivnost",
            "Pridruži se grupi sa sličnim interesovanjima",
            "Komplimenraj 3 ljudi danas",
            "Započni razgovor u javnom prevozu",
            "Predstavi se nekome interesantnom"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni mali razgovor sa strancem",
            "Komplimenraj nekome danas",
            "Pozovi prijatelja da se vidite",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni razgovor online"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome",
            "Odgovori na poruku prijatelja",
            "Kaži 'dobar dan' nekome",
            "Izađi napolje na 15 minuta"
          ]
        },
        female: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Započni razgovor sa nekim novim",
            "Pozovi prijateljicu na aktivnost",
            "Pridruži se grupi sa sličnim interesovanjima",
            "Komplimenraj 3 ljudi danas",
            "Započni razgovor u javnom prevozu",
            "Predstavi se nekome interesantnom"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni mali razgovor sa strancem",
            "Komplimenraj nekome danas",
            "Pozovi prijateljicu da se vidite",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni razgovor online"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome",
            "Odgovori na poruku prijateljice",
            "Kaži 'dobar dan' nekome",
            "Izađi napolje na 15 minuta"
          ]
        },
        neutral: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Započni razgovor sa nekim novim",
            "Pozovi prijatelja na aktivnost",
            "Pridruži se grupi sa sličnim interesovanjima",
            "Komplimenraj 3 ljudi danas",
            "Započni razgovor u javnom prevozu",
            "Predstavi se nekome interesantnom"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni mali razgovor sa strancem",
            "Komplimenraj nekome danas",
            "Pozovi prijatelja da se vidite",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni razgovor online"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome",
            "Odgovori na poruku prijatelja",
            "Kaži 'dobar dan' nekome",
            "Izađi napolje na 15 minuta"
          ]
        }
      }
    };

    const anxietyCategory = anxietyLevel <= 3 ? 'high' : anxietyLevel <= 7 ? 'medium' : 'low';
    const pool = challengePool[occupation]?.[gender]?.[anxietyCategory] || challengePool.student.neutral.medium;
    
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5).map((text, idx) => ({
      id: Date.now() + idx,
      text,
      completed: false
    }));
  };

  const shuffleChallenge = (challengeId) => {
    const gender = user.gender || "neutral";
    const occupation = user.occupation || "student";
    const anxietyLevel = user.anxietyLevel || 5;

    const challengePool = {
      student: {
        male: {
          low: [
            "Pozdravi 5 novih kolega danas",
            "Organizuj grupu za učenje",
            "Vodi prezentaciju pred razredom",
            "Započni razgovor sa profesorom nakon časa",
            "Pridruži se novom klubu ili aktivnosti",
            "Predloži projekat grupi",
            "Pozovi kolege na kafu posle predavanja",
            "Predstavi se nekome ko ti se čini interesantnim"
          ],
          medium: [
            "Pozdravi 3 nova kolegu danas",
            "Postavi jedno pitanje na času",
            "Sedni pored nekoga novog u menzi",
            "Pridruži se grupi koja razgovara na pauzi",
            "Komplimenraj nekome danas",
            "Razmeni kontakt sa nekim novim",
            "Učestvuj u diskusiji na času"
          ],
          high: [
            "Pozdravi jednog kolegu danas",
            "Nasmeši se nekome u hodniku",
            "Odgovori na jedno pitanje u grupi na WhatsAppu",
            "Sedni u razredu pored nekoga",
            "Kaži 'dobar dan' profesoru"
          ]
        },
        female: {
          low: [
            "Pozdravi 5 novih koleginica danas",
            "Organizuj grupu za učenje",
            "Vodi prezentaciju pred razredom",
            "Započni razgovor sa profesorkom nakon časa",
            "Pridruži se novom klubu ili aktivnosti",
            "Predloži projekat grupi",
            "Pozovi koleginice na kafu posle predavanja",
            "Predstavi se nekome ko ti se čini interesantnim"
          ],
          medium: [
            "Pozdravi 3 nove koleginice danas",
            "Postavi jedno pitanje na času",
            "Sedni pored nekoga novog u menzi",
            "Pridruži se grupi koja razgovara na pauzi",
            "Komplimenraj nekome danas",
            "Razmeni kontakt sa nekim novim",
            "Učestvuj u diskusiji na času"
          ],
          high: [
            "Pozdravi jednu koleginicu danas",
            "Nasmeši se nekome u hodniku",
            "Odgovori na jedno pitanje u grupi na WhatsAppu",
            "Sedni u razredu pored nekoga",
            "Kaži 'dobar dan' profesorki"
          ]
        },
        neutral: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Organizuj grupu za učenje",
            "Vodi prezentaciju pred razredom",
            "Započni razgovor sa profesorom nakon časa",
            "Pridruži se novom klubu ili aktivnosti",
            "Predloži projekat grupi",
            "Pozovi kolege na kafu posle predavanja",
            "Predstavi se nekome ko ti se čini interesantnim"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Postavi jedno pitanje na času",
            "Sedni pored nekoga novog u menzi",
            "Pridruži se grupi koja razgovara na pauzi",
            "Komplimenraj nekome danas",
            "Razmeni kontakt sa nekim novim",
            "Učestvuj u diskusiji na času"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome u hodniku",
            "Odgovori na jedno pitanje u grupi na WhatsAppu",
            "Sedni u razredu pored nekoga",
            "Kaži 'dobar dan' profesoru"
          ]
        }
      },
      worker: {
        male: {
          low: [
            "Pozdravi 5 novih kolega danas",
            "Predloži jednu ideju na sastanku",
            "Organizuj team building",
            "Vodi prezentaciju pred timom",
            "Pozovi kolege na ručak",
            "Započni razgovor sa menadžerom",
            "Umreži se sa nekim iz drugog odeljenja",
            "Predloži inovaciju u procesu"
          ],
          medium: [
            "Pozdravi 3 nova kolegu danas",
            "Postavi pitanje na sastanku",
            "Pozovi kolegu na kafu",
            "Započni razgovor sa nekim iz drugog tima",
            "Ponudi pomoć kolegi",
            "Podeli svoju ideju sa timom",
            "Razmeni mišljenje o projektu"
          ],
          high: [
            "Pozdravi jednog kolegu danas",
            "Nasmeši se kolegi u hodniku",
            "Odgovori na email brzo",
            "Kaži 'dobar dan' na sastanku",
            "Poslušaj tuđe mišljenje bez komentara"
          ]
        },
        female: {
          low: [
            "Pozdravi 5 novih koleginica danas",
            "Predloži jednu ideju na sastanku",
            "Organizuj team building",
            "Vodi prezentaciju pred timom",
            "Pozovi koleginice na ručak",
            "Započni razgovor sa menadžerkom",
            "Umreži se sa nekim iz drugog odeljenja",
            "Predloži inovaciju u procesu"
          ],
          medium: [
            "Pozdravi 3 nove koleginice danas",
            "Postavi pitanje na sastanku",
            "Pozovi koleginicu na kafu",
            "Započni razgovor sa nekim iz drugog tima",
            "Ponudi pomoć koleginici",
            "Podeli svoju ideju sa timom",
            "Razmeni mišljenje o projektu"
          ],
          high: [
            "Pozdravi jednu koleginicu danas",
            "Nasmeši se koleginici u hodniku",
            "Odgovori na email brzo",
            "Kaži 'dobar dan' na sastanku",
            "Poslušaj tuđe mišljenje bez komentara"
          ]
        },
        neutral: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Predloži jednu ideju na sastanku",
            "Organizuj team building",
            "Vodi prezentaciju pred timom",
            "Pozovi kolege na ručak",
            "Započni razgovor sa menadžerom",
            "Umreži se sa nekim iz drugog odeljenja",
            "Predloži inovaciju u procesu"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Postavi pitanje na sastanku",
            "Pozovi kolegu na kafu",
            "Započni razgovor sa nekim iz drugog tima",
            "Ponudi pomoć kolegi",
            "Podeli svoju ideju sa timom",
            "Razmeni mišljenje o projektu"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se kolegi u hodniku",
            "Odgovori na email brzo",
            "Kaži 'dobar dan' na sastanku",
            "Poslušaj tuđe mišljenje bez komentara"
          ]
        }
      },
      unemployed: {
        male: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Razgovaraj sa nekim u redu 5 minuta",
            "Pozovi prijatelja na kafu",
            "Pridruži se lokalnoj grupi ili aktivnosti",
            "Započni razgovor u teretani/parku",
            "Upoznaj komšiju",
            "Idi na networking događaj"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni razgovor sa nekim u redu",
            "Komplimenraj nekome danas",
            "Pozovi prijatelja na šetnju",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni mali razgovor sa strancem"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome na ulici",
            "Kaži 'dobar dan' komšiji",
            "Odgovori na poruku prijatelja",
            "Izađi napolje na 10 minuta"
          ]
        },
        female: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Razgovaraj sa nekim u redu 5 minuta",
            "Pozovi prijateljicu na kafu",
            "Pridruži se lokalnoj grupi ili aktivnosti",
            "Započni razgovor u teretani/parku",
            "Upoznaj komšinicu",
            "Idi na networking događaj"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni razgovor sa nekim u redu",
            "Komplimenraj nekome danas",
            "Pozovi prijateljicu na šetnju",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni mali razgovor sa strancem"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome na ulici",
            "Kaži 'dobar dan' komšinici",
            "Odgovori na poruku prijateljice",
            "Izađi napolje na 10 minuta"
          ]
        },
        neutral: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Razgovaraj sa nekim u redu 5 minuta",
            "Pozovi prijatelja na kafu",
            "Pridruži se lokalnoj grupi ili aktivnosti",
            "Započni razgovor u teretani/parku",
            "Upoznaj komšiju",
            "Idi na networking događaj"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni razgovor sa nekim u redu",
            "Komplimenraj nekome danas",
            "Pozovi prijatelja na šetnju",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni mali razgovor sa strancem"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome na ulici",
            "Kaži 'dobar dan' komšiji",
            "Odgovori na poruku prijatelja",
            "Izađi napolje na 10 minuta"
          ]
        }
      },
      entrepreneur: {
        male: {
          low: [
            "Kontaktiraj 5 potencijalnih klijenata",
            "Vodi prezentaciju pred investitorima",
            "Organizuj networking događaj",
            "Pozovi poslovnog partnera na ručak",
            "Podeli svoju viziju javno",
            "Započni saradnju sa nekim novim",
            "Prisustvuj poslovnoj konferenciji"
          ],
          medium: [
            "Kontaktiraj 2 potencijalna klijenta",
            "Podeli svoju ideju sa nekim novim",
            "Umreži se sa nekim iz tvoje industrije",
            "Zatraži feedback od nekoga",
            "Pozovi poslovnog partnera na kafu",
            "Predstavi se potencijalnom klijentu",
            "Podeli svoj biznis na društvenim mrežama"
          ],
          high: [
            "Kontaktiraj jednog potencijalnog klijenta",
            "Odgovori na poslovni email",
            "Podeli jedan post o svom biznisu",
            "Razgovaraj sa jednim klijentom",
            "Zatraži savet od mentora"
          ]
        },
        female: {
          low: [
            "Kontaktiraj 5 potencijalnih klijenata",
            "Vodi prezentaciju pred investitorima",
            "Organizuj networking događaj",
            "Pozovi poslovnu partnerku na ručak",
            "Podeli svoju viziju javno",
            "Započni saradnju sa nekim novim",
            "Prisustvuj poslovnoj konferenciji"
          ],
          medium: [
            "Kontaktiraj 2 potencijalna klijenta",
            "Podeli svoju ideju sa nekim novim",
            "Umreži se sa nekim iz tvoje industrije",
            "Zatraži feedback od nekoga",
            "Pozovi poslovnu partnerku na kafu",
            "Predstavi se potencijalnom klijentu",
            "Podeli svoj biznis na društvenim mrežama"
          ],
          high: [
            "Kontaktiraj jednog potencijalnog klijenta",
            "Odgovori na poslovni email",
            "Podeli jedan post o svom biznisu",
            "Razgovaraj sa jednim klijentom",
            "Zatraži savet od mentorice"
          ]
        },
        neutral: {
          low: [
            "Kontaktiraj 5 potencijalnih klijenata",
            "Vodi prezentaciju pred investitorima",
            "Organizuj networking događaj",
            "Pozovi poslovnog partnera na ručak",
            "Podeli svoju viziju javno",
            "Započni saradnju sa nekim novim",
            "Prisustvuj poslovnoj konferenciji"
          ],
          medium: [
            "Kontaktiraj 2 potencijalna klijenta",
            "Podeli svoju ideju sa nekim novim",
            "Umreži se sa nekim iz tvoje industrije",
            "Zatraži feedback od nekoga",
            "Pozovi poslovnog partnera na kafu",
            "Predstavi se potencijalnom klijentu",
            "Podeli svoj biznis na društvenim mrežama"
          ],
          high: [
            "Kontaktiraj jednog potencijalnog klijenta",
            "Odgovori na poslovni email",
            "Podeli jedan post o svom biznisu",
            "Razgovaraj sa jednim klijentom",
            "Zatraži savet od mentora"
          ]
        }
      },
      other: {
        male: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Započni razgovor sa nekim novim",
            "Pozovi prijatelja na aktivnost",
            "Pridruži se grupi sa sličnim interesovanjima",
            "Komplimenraj 3 ljudi danas",
            "Započni razgovor u javnom prevozu",
            "Predstavi se nekome interesantnom"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni mali razgovor sa strancem",
            "Komplimenraj nekome danas",
            "Pozovi prijatelja da se vidite",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni razgovor online"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome",
            "Odgovori na poruku prijatelja",
            "Kaži 'dobar dan' nekome",
            "Izađi napolje na 15 minuta"
          ]
        },
        female: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Započni razgovor sa nekim novim",
            "Pozovi prijateljicu na aktivnost",
            "Pridruži se grupi sa sličnim interesovanjima",
            "Komplimenraj 3 ljudi danas",
            "Započni razgovor u javnom prevozu",
            "Predstavi se nekome interesantnom"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni mali razgovor sa strancem",
            "Komplimenraj nekome danas",
            "Pozovi prijateljicu da se vidite",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni razgovor online"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome",
            "Odgovori na poruku prijateljice",
            "Kaži 'dobar dan' nekome",
            "Izađi napolje na 15 minuta"
          ]
        },
        neutral: {
          low: [
            "Pozdravi 5 novih ljudi danas",
            "Započni razgovor sa nekim novim",
            "Pozovi prijatelja na aktivnost",
            "Pridruži se grupi sa sličnim interesovanjima",
            "Komplimenraj 3 ljudi danas",
            "Započni razgovor u javnom prevozu",
            "Predstavi se nekome interesantnom"
          ],
          medium: [
            "Pozdravi 3 nova čoveka danas",
            "Započni mali razgovor sa strancem",
            "Komplimenraj nekome danas",
            "Pozovi prijatelja da se vidite",
            "Predstavi se nekome novom",
            "Razmeni kontakt sa nekim",
            "Započni razgovor online"
          ],
          high: [
            "Pozdravi jednu osobu danas",
            "Nasmeši se nekome",
            "Odgovori na poruku prijatelja",
            "Kaži 'dobar dan' nekome",
            "Izađi napolje na 15 minuta"
          ]
        }
      }
    };

    const anxietyCategory = anxietyLevel <= 3 ? 'high' : anxietyLevel <= 7 ? 'medium' : 'low';
    const pool = challengePool[occupation]?.[gender]?.[anxietyCategory] || challengePool.student.neutral.medium;
    
    const currentTexts = challenges.map(c => c.text);
    const availablePool = pool.filter(text => !currentTexts.includes(text));
    
    if (availablePool.length === 0) return;

    const newChallenge = availablePool[Math.floor(Math.random() * availablePool.length)];
    
    const updated = challenges.map(ch => 
      ch.id === challengeId ? { ...ch, text: newChallenge, completed: false } : ch
    );
    
    setChallenges(updated);
    localStorage.setItem(`challenges_${user.id}`, JSON.stringify(updated));
  };

  const toggleChallenge = (id) => {
    const updated = challenges.map(ch => 
      ch.id === id ? { ...ch, completed: !ch.completed } : ch
    );
    setChallenges(updated);
    localStorage.setItem(`challenges_${user.id}`, JSON.stringify(updated));

    const completedList = JSON.parse(localStorage.getItem(`completed_${user.id}`) || "[]");
    const challengeCompleted = updated.find(ch => ch.id === id)?.completed;
    
    if (challengeCompleted && !completedList.includes(id)) {
      completedList.push(id);
      setCompletedChallenges(completedList);
      localStorage.setItem(`completed_${user.id}`, JSON.stringify(completedList));
      updateLifetimeCompleted(user.id);
    } else if (!challengeCompleted) {
      const filtered = completedList.filter(cid => cid !== id);
      setCompletedChallenges(filtered);
      localStorage.setItem(`completed_${user.id}`, JSON.stringify(filtered));
    }
  };

  const submitFeeling = (feeling) => {
    const newFeeling = {
      date: new Date().toISOString().split('T')[0],
      feeling
    };

    const updatedFeelings = [...feelingsHistory, newFeeling];
    setFeelingsHistory(updatedFeelings);
    setDailyFeeling(feeling);
    setCanAnswerFeeling(false);

    localStorage.setItem(`feelings_${user.id}`, JSON.stringify(updatedFeelings));
    localStorage.setItem(`lastFeeling_${user.id}`, Date.now().toString());
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  const getFeelingsStats = () => {
    const last7Days = feelingsHistory.slice(-7);
    const counts = {
      "Više samopouzdanja": 0,
      "Manje samopouzdanja": 0,
      "Neutralno": 0,
      "Uzbuđen/a": 0,
      "Anksiozno": 0
    };

    last7Days.forEach(f => {
      if (counts.hasOwnProperty(f.feeling)) {
        counts[f.feeling]++;
      }
    });

    return counts;
  };

  const getGenderText = (gender) => {
    if (gender === "male") return "Dobrodošao nazad";
    if (gender === "female") return "Dobrodošla nazad";
    return "Dobrodošao/la nazad";
  };

  const getFeelingQuestion = (gender) => {
    if (gender === "male") return "Kako si se osećao danas?";
    if (gender === "female") return "Kako si se osećala danas?";
    return "Kako si se osećao/la danas?";
  };

  if (!user) {
    return (
      <>
        <style>{`
          html, body, #root {
            width: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: "Inter", sans-serif;
            scroll-behavior: smooth;
          }

          .home {
            min-height: 100vh;
            background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
            color: white;
          }

          .header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 60px;
            background: rgba(10, 20, 26, 0.95);
            backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.08);
            transform: translateY(0);
            transition: transform 0.35s ease;
          }

          .header.hidden {
            transform: translateY(-100%);
          }

          .logo {
            font-size: 1.8rem;
            font-weight: 700;
            letter-spacing: 1px;
          }

          .nav a {
            margin-left: 30px;
            text-decoration: none;
            color: white;
            opacity: 0.85;
            transition: opacity 0.2s ease, transform 0.2s ease;
            cursor: pointer;
          }

          .nav a:hover {
            opacity: 1;
            transform: translateY(-1px);
          }

          .login-btn {
            padding: 10px 20px;
            border-radius: 999px;
            background: #00ffb3;
            color: #0f2027;
            font-weight: 700;
            opacity: 1;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }

          .login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 255, 179, 0.35);
          }

          .hero {
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            padding-top: 80px;
          }

          .slogan {
            font-size: 4rem;
            font-weight: 800;
            margin-bottom: 20px;
          }

          .tagline {
            font-size: 1.2rem;
            opacity: 0.9;
            max-width: 500px;
            margin-bottom: 40px;
          }

          .start-btn {
            padding: 15px 50px;
            font-size: 1.1rem;
            font-weight: 600;
            border: none;
            border-radius: 30px;
            background: #00ffb3;
            color: #0f2027;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .start-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(0, 255, 179, 0.3);
          }

          .how {
            padding: 120px 80px;
            background: #0f2027;
            text-align: center;
          }

          .how h2 {
            font-size: 2.8rem;
            margin-bottom: 60px;
          }

          .cards {
            display: flex;
            justify-content: center;
            gap: 40px;
            flex-wrap: wrap;
          }

          .card {
            background: #203a43;
            padding: 40px 30px;
            width: 300px;
            border-radius: 20px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4);
          }

          .card h3 {
            font-size: 1.4rem;
            margin-bottom: 15px;
          }

          .card p {
            opacity: 0.9;
            line-height: 1.6;
          }

          .footer {
            background: #0a141a;
            padding: 80px 60px 40px;
            border-top: 1px solid rgba(255,255,255,0.08);
          }

          .footer-content {
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 40px;
            margin-bottom: 40px;
          }

          .footer-section h3 {
            margin-bottom: 15px;
            font-size: 1.2rem;
          }

          .footer-section p {
            opacity: 0.85;
            line-height: 1.6;
          }

          .footer-section a {
            display: block;
            color: #00ffb3;
            text-decoration: none;
            margin-top: 6px;
            font-size: 0.95rem;
          }

          .footer-bottom {
            text-align: center;
            font-size: 0.85rem;
            opacity: 0.6;
            border-top: 1px solid rgba(255,255,255,0.08);
            padding-top: 20px;
          }
        `}</style>

        <div className="home">
          <header className={`header ${showHeader ? "" : "hidden"}`}>
            <div className="logo">Thrive</div>
            <nav className="nav">
              <a href="#how">Kako radi</a>
              <a href="#footer">Kontakt</a>
              <a onClick={() => navigate("/login")} className="login-btn">Prijavi se</a>
            </nav>
          </header>

          <main className="hero">
            <h1 className="slogan">Van okvira.</h1>
            <p className="tagline">
              Svaki dan mali izazov koji te gura van zone komfora.
            </p>
            <button onClick={() => navigate("/login")} className="start-btn">
              Počni
            </button>
          </main>

          <section className="how" id="how">
            <h2>Kako radi</h2>

            <div className="cards">
              <div className="card">
                <h3>Dnevni izazovi</h3>
                <p>
                  Svaki dan dobijaš mali društveni izazov prilagođen tvom tipu
                  ličnosti i svakodnevnom okruženju.
                </p>
              </div>

              <div className="card">
                <h3>Izlazak iz zone komfora</h3>
                <p>
                  Postepeno se suočavaš sa novim društvenim situacijama i gradiš
                  samopouzdanje bez pritiska.
                </p>
              </div>

              <div className="card">
                <h3>Praćenje napretka</h3>
                <p>
                  Pratiš svoj napredak, skupljaš uspehe i vidiš koliko si daleko
                  stigao.
                </p>
              </div>
            </div>
          </section>

          <footer className="footer" id="footer">
            <div className="footer-content">
              <div className="footer-section">
                <h3>Thrive</h3>
                <p>
                  Platforma za lični razvoj i izlazak iz zone komfora.
                </p>
              </div>

              <div className="footer-section">
                <h3>Kontakt</h3>
                <a href="mailto:bibictahir@gmail.com">bibictahir@gmail.com</a>
                <a href="tel:+381628109178">+381 62 8109 178</a>
              </div>
            </div>

            <div className="footer-bottom">
              © {new Date().getFullYear()} Thrive. All rights reserved.
            </div>
          </footer>
        </div>
      </>
    );
  }

  const feelingStats = getFeelingsStats();

  return (
    <>
      <style>{`
        html, body, #root {
          width: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: "Inter", sans-serif;
          scroll-behavior: smooth;
        }

        .home {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
          color: white;
        }

        .header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 60px;
          background: rgba(10, 20, 26, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          transform: translateY(0);
          transition: transform 0.35s ease;
        }

        .header.hidden {
          transform: translateY(-100%);
        }

        .logo {
          font-size: 1.8rem;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .nav {
          display: flex;
          align-items: center;
        }

        .nav a {
          margin-left: 30px;
          text-decoration: none;
          color: white;
          opacity: 0.85;
          transition: opacity 0.2s ease, transform 0.2s ease;
          cursor: pointer;
        }

        .nav a:hover {
          opacity: 1;
          transform: translateY(-1px);
        }

        .settings-wrap {
          position: relative;
          display: inline-block;
          margin-left: 30px;
        }

        .settings-btn {
          padding: 10px 18px;
          border-radius: 999px;
          background: #00ffb3;
          color: white;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          font-size: 1.2rem;
        }

        .settings-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0, 255, 179, 0.35);
        }

        .dropdown {
          position: absolute;
          top: 55px;
          right: 0;
          background: #203a43;
          border-radius: 14px;
          min-width: 220px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.5);
          overflow: hidden;
          z-index: 2000;
        }

        .drop-item {
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          transition: background 0.2s ease;
          font-weight: 600;
        }

        .drop-item:hover {
          background: rgba(255,255,255,0.06);
        }

        .drop-settings {
          color: white;
        }

        .drop-logout {
          color: #ff5a5a;
          background: rgba(255,90,90,0.08);
        }

        .dashboard {
          padding: 120px 60px 60px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .welcome {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
        }

        .subtitle {
          font-size: 1.1rem;
          opacity: 0.8;
          margin-bottom: 50px;
        }

        .section {
          background: rgba(32, 58, 67, 0.6);
          border-radius: 20px;
          padding: 40px;
          margin-bottom: 40px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .section-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 25px;
          color: #00ffb3;
        }

        .challenge-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .challenge-item {
          background: rgba(15, 32, 39, 0.5);
          padding: 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .challenge-item:hover {
          transform: translateX(5px);
          box-shadow: 0 5px 15px rgba(0, 255, 179, 0.1);
        }

        .checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid #00ffb3;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .checkbox.checked {
          background: #00ffb3;
        }

        .checkmark {
          color: #0f2027;
          font-weight: 900;
          font-size: 16px;
        }

        .challenge-text {
          font-size: 1.1rem;
          flex-grow: 1;
          cursor: pointer;
        }

        .challenge-text.completed {
          text-decoration: line-through;
          opacity: 0.6;
        }

        .shuffle-btn {
          padding: 8px 12px;
          background: rgba(0, 255, 179, 0.1);
          border: 1px solid #00ffb3;
          border-radius: 8px;
          color: #00ffb3;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .shuffle-btn:hover {
          background: #00ffb3;
          color: #0f2027;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-card {
          background: rgba(15, 32, 39, 0.5);
          padding: 25px;
          border-radius: 12px;
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: #00ffb3;
          margin-bottom: 8px;
        }

        .stat-label {
          font-size: 0.95rem;
          opacity: 0.8;
        }

        .feelings-bar {
          display: flex;
          gap: 15px;
          margin-top: 20px;
        }

        .feeling-option {
          flex: 1;
          padding: 15px;
          background: rgba(15, 32, 39, 0.5);
          border: 2px solid transparent;
          border-radius: 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
        }

        .feeling-option:hover:not(.disabled) {
          border-color: #00ffb3;
          transform: translateY(-2px);
        }

        .feeling-option.selected {
          background: #00ffb3;
          color: #0f2027;
          border-color: #00ffb3;
          font-weight: 700;
        }

        .feeling-option.disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .disabled-message {
          margin-top: 15px;
          padding: 15px;
          background: rgba(255, 179, 0, 0.1);
          border-radius: 8px;
          text-align: center;
          color: #ffb300;
          font-size: 0.95rem;
        }

        .chart-container {
          background: rgba(15, 32, 39, 0.5);
          padding: 30px;
          border-radius: 12px;
          margin-top: 20px;
        }

        .chart-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 20px;
          opacity: 0.9;
        }

        .bar-chart {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .bar-row {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .bar-label {
          width: 180px;
          font-size: 0.95rem;
          opacity: 0.8;
        }

        .bar-container {
          flex: 1;
          height: 30px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #00ffb3, #00cc8f);
          border-radius: 8px;
          transition: width 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 10px;
          font-size: 0.85rem;
          font-weight: 700;
          color: #0f2027;
        }
      `}</style>

      <div className="home">
        <header className={`header ${showHeader ? "" : "hidden"}`}>
          <div className="logo">Thrive</div>
          <nav className="nav">
            <a>Ćao, {user.name}</a>

            <div className="settings-wrap">
              <div className="settings-btn" onClick={() => setOpenMenu(!openMenu)}>
                ⚙
              </div>

              {openMenu && (
                <div className="dropdown">
                  <div
                    className="drop-item drop-settings"
                    onClick={() => navigate("/AccountSettings")}
                  >
                    ⚙ Account Settings
                  </div>
                  <div
                    className="drop-item drop-logout"
                    onClick={logout}
                  >
                    ✖ Log out
                  </div>
                </div>
              )}
            </div>
          </nav>
        </header>

        <div className="dashboard">
          <h1 className="welcome">{getGenderText(user.gender)}, {user.name}!</h1>
          <p className="subtitle">Nastavi da gradiš svoje samopouzdanje svaki dan.</p>

          <div className="section">
            <h2 className="section-title">Današnji izazovi</h2>
            <div className="challenge-list">
              {challenges.map(challenge => (
                <div key={challenge.id} className="challenge-item">
                  <div 
                    className={`checkbox ${challenge.completed ? 'checked' : ''}`}
                    onClick={() => toggleChallenge(challenge.id)}
                  >
                    {challenge.completed && <span className="checkmark">✓</span>}
                  </div>
                  <div 
                    className={`challenge-text ${challenge.completed ? 'completed' : ''}`}
                    onClick={() => toggleChallenge(challenge.id)}
                  >
                    {challenge.text}
                  </div>
                  <button 
                    className="shuffle-btn"
                    onClick={() => shuffleChallenge(challenge.id)}
                  >
                    Pomešaj
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">Tvoj napredak</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{lifetimeCompleted}</div>
                <div className="stat-label">Ukupno završenih izazova</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{feelingsHistory.length}</div>
                <div className="stat-label">Dana praćenja</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">
                  {challenges.filter(ch => ch.completed).length}/{challenges.length}
                </div>
                <div className="stat-label">Današnji progres</div>
              </div>
            </div>

            <div className="chart-container">
              <div className="chart-title">Kako si se osećao/la (zadnjih 7 dana)</div>
              <div className="bar-chart">
                {Object.entries(feelingStats).map(([feeling, count]) => (
                  <div key={feeling} className="bar-row">
                    <div className="bar-label">{feeling}</div>
                    <div className="bar-container">
                      <div
                        className="bar-fill"
                        style={{ width: `${(count / 7) * 100}%` }}
                      >
                        {count > 0 && count}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="section">
            <h2 className="section-title">{getFeelingQuestion(user.gender)}</h2>
            {!canAnswerFeeling && (
              <div className="disabled-message">
                Već si odgovorio/la danas. Vrati se sutra!
              </div>
            )}
            <div className="feelings-bar">
              {["Više samopouzdanja", "Manje samopouzdanja", "Neutralno", "Uzbuđen/a", "Anksiozno"].map(feeling => (
                <div
                  key={feeling}
                  className={`feeling-option ${dailyFeeling === feeling ? 'selected' : ''} ${!canAnswerFeeling ? 'disabled' : ''}`}
                  onClick={() => canAnswerFeeling && submitFeeling(feeling)}
                >
                  {feeling}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;