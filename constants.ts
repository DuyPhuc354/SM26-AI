
import type { DetailedTactic } from './types';

export const guideContent = [
  {
    title: "Hiểu rõ Meta Game SM26",
    content: ["Soccer Manager 2026 ưu ái lối đá pressing tốc độ cao và phản công chớp nhoáng. Thành công phụ thuộc vào việc tận dụng các tiền đạo nhanh nhẹn, các cầu thủ chạy cánh có khả năng cắt vào trong và dứt điểm, cùng một hệ thống pressing đồng bộ trên toàn sân."],
    list: [
      "Tốc độ là Vua: Những cầu thủ có chỉ số Tốc độ (Speed), Tăng tốc (Acceleration), và Rê bóng (Dribbling) cao chiếm ưu thế vượt trội.",
      "Pressing tầm cao: Chỉ thị pressing 'All Over' (Toàn sân) cực kỳ hiệu quả để đoạt bóng ngay trên phần sân đối phương.",
      "Phản công sắc bén: Tận dụng các pha phản công sau tình huống cố định của đối thủ là một trong những chiến thuật ghi bàn hiệu quả nhất.",
      "Sút xa và Cắt vào trong: Các cầu thủ chạy cánh chơi nghịch chân (thuận chân phải đá cánh trái và ngược lại) có xu hướng ghi nhiều bàn thắng hơn."
    ]
  },
  {
    title: "Xây dựng Chiến thuật (Từng bước)",
    content: ["Một chiến thuật tốt bắt đầu từ việc hiểu rõ đội hình của bạn. Hãy làm theo các bước sau để tạo ra một hệ thống chiến thuật hiệu quả."],
    list: [
      "Bước 1: Phân tích đội hình - Xác định điểm mạnh, điểm yếu và những cầu thủ chủ chốt của bạn.",
      "Bước 2: Chọn Sơ đồ - Lựa chọn sơ đồ phù hợp nhất với các cầu thủ bạn có. Các sơ đồ như 4-2-3-1, 4-3-3 và 3-5-2 đang rất thịnh hành.",
      "Bước 3: Thiết lập Chỉ thị Chung - Tinh chỉnh các thiết lập về Lối chơi Rộng (Width), Lối chơi (Mentality) và Nhịp độ (Tempo) để định hình phong cách cho toàn đội.",
      "Bước 4: Giao vai trò cho cầu thủ - Gán vai trò (Role) cụ thể cho từng vị trí để tối đa hóa khả năng của họ. Sự kết hợp vai trò hợp lý là chì khóa thành công.",
    ]
  },
  {
    title: "Giải thích các Vai trò Cầu thủ then chốt",
    content: ["Việc giao đúng vai trò còn quan trọng hơn cả việc chọn đúng cầu thủ. Mỗi vai trò có những hành vi và yêu cầu chỉ số riêng biệt."],
    list: [
      "Ball-Playing Defender (DC): Trung vệ kiến thiết, có khả năng phát động tấn công từ tuyến dưới. Yêu cầu chỉ số Chuyền bóng (Passing) và Điềm tĩnh (Composure) cao.",
      "Wingback (DL/DR): Hậu vệ cánh tấn công, lên công về thủ không biết mệt mỏi. Yêu cầu Tốc độ (Speed), Thể lực (Stamina) và Tạt bóng (Crossing) cao.",
      "Ball-Winning Midfielder (MC/DMC): Máy quét ở tuyến giữa, chuyên phá lối chơi đối thủ. Yêu cầu Xoạc bóng (Tackling) và Tinh thần đồng đội (Work Rate) cao.",
      "Advanced Playmaker (AMC/MC): Nhạc trưởng, bộ não sáng tạo ở 1/3 sân đối phương. Yêu cầu Sáng tạo (Creativity), Chuyền bóng (Passing) và Rê bóng (Dribbling) cao.",
      "Wide Forward (AML/AMR): Tiền đạo cánh, chuyên cắt vào trung lộ để dứt điểm hoặc kiến tạo. Yêu cầu Rê bóng (Dribbling), Tốc độ (Speed) và Dứt điểm (Finishing) cao.",
      "Finisher (FC): Sát thủ trong vòng cấm, nhiệm vụ chính là ghi bàn. Yêu cầu Dứt điểm (Finishing), Điềm tĩnh (Composure) và Chạy chỗ (Off-the-ball) cao."
    ]
  },
  {
    title: "Các Khái niệm Nâng cao",
    content: ["Khi đã nắm vững những điều cơ bản, hãy thử nghiệm các khái niệm nâng cao này để đưa chiến thuật của bạn lên một tầm cao mới."],
    list: [
      "Sự linh hoạt (Fluidity): 'Adventurous' (Phiêu lưu) cho phép cầu thủ tự do di chuyển và hoán đổi vị trí, tạo ra sự đột biến nhưng yêu cầu cầu thủ thông minh. 'Disciplined' (Kỷ luật) giữ cho đội hình chặt chẽ.",
      "Tùy chỉnh trong trận đấu: Đừng ngại thay đổi Lối chơi (Mentality) trong trận. Chuyển sang 'Attacking' khi cần bàn thắng, hoặc 'Defensive' để bảo toàn tỷ số.",
      "Hậu vệ cánh ảo (Inverted Wingbacks): Một chiến thuật hiện đại yêu cầu hậu vệ cánh bó vào trung lộ khi tấn công, tạo lợi thế quân số ở tuyến giữa."
    ]
  }
];

export const PLAYER_ROLE_DESCRIPTIONS: Record<string, string> = {
    'Keeper': 'Thủ môn truyền thống, tập trung vào việc cản phá các cú sút.',
    'Modern Keeper': 'Thủ môn quét, tham gia phòng ngự bên ngoài vòng cấm và phát động tấn công.',
    'Stopper': 'Trung vệ dập, chủ động áp sát và truy cản tiền đạo đối phương.',
    'General Defender': 'Trung vệ toàn diện, thực hiện các nhiệm vụ phòng ngự cơ bản.',
    'Ball-Playing Defender': 'Trung vệ kiến thiết, có khả năng phát động tấn công từ tuyến dưới.',
    'Wingback': 'Hậu vệ cánh tấn công, thường xuyên dâng cao hỗ trợ tấn công.',
    'Fullback': 'Hậu vệ cánh truyền thống, ưu tiên nhiệm vụ phòng ngự.',
    'Wide Midfielder': 'Tiền vệ cánh, cân bằng giữa tấn công và phòng ngự ở hai biên.',
    'Ball-Winning Midfielder': 'Tiền vệ thu hồi bóng, chuyên phá lối chơi của đối thủ.',
    'Box-to-box Midfielder': 'Tiền vệ con thoi, hoạt động năng nổ trên khắp mặt sân.',
    'General Midfielder': 'Tiền vệ trung tâm đa năng, thực hiện nhiều nhiệm vụ khác nhau.',
    'Advanced Playmaker': 'Tiền vệ kiến thiết dâng cao, là nguồn sáng tạo chính cho các đợt tấn công.',
    'Deep-lying Playmaker': 'Tiền vệ kiến thiết lùi sâu, điều tiết nhịp độ trận đấu từ tuyến dưới.',
    'Playmaker': 'Tiền vệ kiến thiết, nhạc trưởng điều tiết lối chơi của toàn đội.',
    'Winger': 'Cầu thủ chạy cánh thuần túy, bám biên để tạt bóng hoặc đi bóng.',
    'Wide Forward': 'Tiền đạo cánh, có xu hướng cắt vào trong để dứt điểm hoặc phối hợp.',
    'Support Striker': 'Tiền đạo hộ công, hoạt động giữa hàng tiền vệ và tiền đạo cắm.',
    'Finisher': 'Tiền đạo săn bàn, chuyên gia dứt điểm trong vòng cấm.',
    'Deep-lying Forward': 'Tiền đạo lùi sâu, kết nối giữa hàng tiền vệ và hàng công.',
    'General Forward': 'Tiền đạo toàn diện, có khả năng ghi bàn, kiến tạo và làm tường.',
    'Target Man': 'Tiền đạo mục tiêu, sử dụng sức mạnh thể chất để làm tường và không chiến.',
};

export const POSITION_TO_ROLES_MAP: Record<string, string[]> = {
    'GK': ['Keeper', 'Modern Keeper'],
    'DC': ['Stopper', 'General Defender', 'Ball-Playing Defender'],
    'DL': ['Wingback', 'Fullback'],
    'DR': ['Wingback', 'Fullback'],
    'DML': ['Wingback', 'Fullback', 'Wide Midfielder'],
    'DMR': ['Wingback', 'Fullback', 'Wide Midfielder'],
    'DMC': ['Ball-Winning Midfielder', 'Box-to-box Midfielder', 'Deep-lying Playmaker'],
    'ML': ['Wingback', 'Winger', 'Playmaker', 'Wide Midfielder'],
    'MR': ['Wingback', 'Winger', 'Playmaker', 'Wide Midfielder'],
    'MC': ['General Midfielder', 'Ball-Winning Midfielder', 'Box-to-box Midfielder', 'Playmaker', 'Advanced Playmaker'],
    'AMC': ['Advanced Playmaker', 'Support Striker'],
    'AML': ['Winger', 'Advanced Playmaker', 'Wide Forward'],
    'AMR': ['Winger', 'Advanced Playmaker', 'Wide Forward'],
    'FL': ['Wide Forward', 'General Forward', 'Winger'],
    'FR': ['Wide Forward', 'General Forward', 'Winger'],
    'FC': ['General Forward', 'Target Man', 'Finisher', 'Deep-lying Forward'],
    'ST': ['General Forward', 'Target Man', 'Finisher', 'Deep-lying Forward'], // Alias for FC
};

export const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

export const PLAYER_ATTRIBUTES: string[] = [
  'Fast Forwards',
  'Creative Midfielders',
  'Solid Defence',
  'Strong Wingers',
  'Possession-based',
  'Counter-attacking threat',
  'Tall Striker',
  'Technical Dribblers',
];

export const communityTactics: DetailedTactic[] = [
    {
      tacticName: "Gegenpress Inferno 4-3-3",
      formation: "4-3-3",
      keyRoles: "GK: Modern Keeper; DC: Ball-playing (x2); DL/DR: Wingback; DMC: Ball-Winning; MC: Box-to-box (x2); AML/AMR: Wide Forward; FC: Finisher",
      generalInstructions: "Width: Wide; Mentality: V.Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Direct; Attacking: Down Both Flanks; Forwards: Shoot on sight; Wide Play: Mixed; Build up: Fast; Counter Attack: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "Dành cho các đội bóng hàng đầu có thể lực dồi dào. Áp đảo đối thủ bằng cách pressing không ngừng nghỉ ngay sau khi mất bóng."
    },
    {
      tacticName: "Overload Powerhouse 4-2-3-1",
      formation: "4-2-3-1",
      keyRoles: "DCs: Stopper/Ball-playing; DL/DR: Wingback; DMCs: Ball-winning/Box-to-box; AMC: Advanced Playmaker; AML/AMR: Wide Forward; FC: Finisher",
      generalInstructions: "Width: Wide; Mentality: Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Direct; Attacking: Down Both Flanks; Forwards: Work ball into box; Wide Play: Byline crosses; Build up: Fast; Counter Attack: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Hard; Back Line: Normal; Sweeper Keeper: Yes; Time Wasting: Normal",
      bestForTips: "Một trong những chiến thuật meta mạnh nhất. Tạo ra sức ép tấn công nghẹt thở với 4 cầu thủ phía trên, phù hợp với mọi đội bóng."
    },
    {
      tacticName: "Unbreakable Wall 5-3-2",
      formation: "5-3-2",
      keyRoles: "GK: Keeper; DC: Stopper (x3); DML/DMR: Wingback; MC: Ball-winning/Box-to-box/Playmaker; FC: Finisher/Deep-lying Forward",
      generalInstructions: "Width: Narrow; Mentality: Defensive; Tempo: Normal; Fluidity: Disciplined; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing: Direct; Attacking: Through the Middle; Forwards: Mixed; Wide Play: Mixed; Build up: Fast; Counter Attack: Yes",
      defenceInstructions: "Pressing: Own Half; Tackling: Hard; Back Line: Low; Sweeper Keeper: No; Time Wasting: High",
      bestForTips: "Lý tưởng cho các đội yếu hơn hoặc để bảo toàn tỉ số. Phòng ngự chặt chẽ và trừng phạt đối thủ bằng những pha phản công sắc lẹm."
    },
    {
      tacticName: "Total Football 3-4-3 Diamond",
      formation: "3-4-3",
      keyRoles: "GK: Modern Keeper; DC: Ball-playing (x3); ML/MR: Wide Midfielder; MC: Deep-lying Playmaker/Advanced Playmaker; FC: Deep-lying Forward, Finisher (x2)",
      generalInstructions: "Width: Wide; Mentality: Attacking; Tempo: Normal; Fluidity: Adventurous; Work Rate: Normal; Creativity: Bold",
      attackInstructions: "Passing: Short; Attacking: Mixed; Forwards: Work ball into box; Wide Play: Mixed; Build up: Slow; Counter Attack: No",
      defenceInstructions: "Pressing: All Over; Tackling: Normal; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "Dành cho các đội có kỹ thuật tốt. Thống trị trận đấu bằng khả năng kiểm soát bóng và tạo ra cơ hội từ sự di chuyển linh hoạt."
    },
    {
      tacticName: "Vietnamese Unbeaten 4-1-2-3",
      formation: "4-1-2-3",
      keyRoles: "GK: Modern Keeper; DL/DR: Wingback; DMC: Deep-lying Playmaker; MC: Box-to-box (x2); AML/AMR: Wide Forward; FC: Finisher",
      generalInstructions: "Width: Wide; Mentality: V.Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Direct; Attacking: Down Both Flanks; Forwards: Shoot on sight; Wide Play: Cut inside; Build up: Fast; Counter Attack: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "Một chiến thuật meta từ cộng đồng SM Việt Nam. Cực kỳ mạnh mẽ trong tấn công và pressing. Dựa vào áp lực không ngừng và các cầu thủ chạy cánh tốc độ."
    },
    {
      tacticName: "Tiki-Taka Dominance 4-1-2-1-2",
      formation: "4-1-2-1-2",
      keyRoles: "GK: Sweeper Keeper; DCs: Ball-playing (x2); DL/DR: Fullback; DMC: Deep-lying Playmaker; MCs: Box-to-box/Advanced Playmaker; AMC: Advanced Playmaker; FCs: Deep-lying Forward/Finisher",
      generalInstructions: "Width: Narrow; Mentality: Attacking; Tempo: Normal; Fluidity: Adventurous; Work Rate: Normal; Creativity: Bold",
      attackInstructions: "Passing: Short; Attacking: Through the Middle; Forwards: Work ball into box; Wide Play: Mixed; Build up: Slow; Counter Attack: No",
      defenceInstructions: "Pressing: Own Half; Tackling: Normal; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "Dành cho các đội có hàng tiền vệ kỹ thuật. Bóp nghẹt đối thủ bằng cách không cho họ chạm bóng và tạo cơ hội qua các đường chuyền tinh tế."
    },
    {
      tacticName: "Route One Express 4-4-2",
      formation: "4-4-2",
      keyRoles: "GK: Keeper; DC: Stopper (x2); DL/DR: Fullback; ML/MR: Winger; MC: Ball-winning/Box-to-box; FC: Target Man/Finisher",
      generalInstructions: "Width: Wide; Mentality: Normal; Tempo: Fast; Fluidity: Disciplined; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing: Long Ball; Attacking: Mixed; Forwards: Shoot on sight; Wide Play: Play early crosses; Build up: Fast; Counter Attack: Yes",
      defenceInstructions: "Pressing: Own Half; Tackling: Hard; Back Line: Normal; Sweeper Keeper: No; Time Wasting: Normal",
      bestForTips: "Lối chơi trực diện, cổ điển. Đưa bóng đến tiền đạo cao to và tiền đạo tốc độ nhanh nhất có thể. Hiệu quả cho các đội yếu về kỹ thuật."
    },
    {
      tacticName: "Korean Firepower 4-2-2-2",
      formation: "4-2-2-2",
      keyRoles: "GK: Modern Keeper; DC: Ball-playing (x2); DL/DR: Wingback; DMC: Box-to-box/Ball-winning; AMC: Advanced Playmaker (x2); FC: Finisher/Deep-lying Forward",
      generalInstructions: "Width: Narrow; Mentality: Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing: Mixed; Attacking: Through the Middle; Forwards: Work ball into box; Wide Play: Mixed; Build up: Fast; Counter Attack: Yes",
      defenceInstructions: "Pressing: All Over; Tackling: Aggressive; Back Line: High; Sweeper Keeper: Yes; Time Wasting: Low",
      bestForTips: "Lấy cảm hứng từ cộng đồng SM Hàn Quốc. Dựa vào các pha phối hợp nhanh, ngắn giữa bộ tứ tấn công để xuyên thủng trung lộ."
    },
    {
      tacticName: "Park the Bus 5-4-1",
      formation: "5-4-1",
      keyRoles: "GK: Keeper; DC: Stopper (x3); DL/DR: Fullback; ML/MR: Wide Midfielder; MC: Ball-winning (x2); FC: Target Man",
      generalInstructions: "Width: Narrow; Mentality: V.Defensive; Tempo: Slow; Fluidity: Disciplined; Work Rate: Slow; Creativity: Cautious",
      attackInstructions: "Passing: Long Ball; Attacking: Mixed; Forwards: Mixed; Wide Play: Mixed; Build up: Slow; Counter Attack: Yes",
      defenceInstructions: "Pressing: Own Area; Tackling: Hard; Back Line: Low; Sweeper Keeper: No; Time Wasting: High",
      bestForTips: "Dùng trong những phút cuối trận để bảo vệ tỉ số mong manh trước đối thủ mạnh. Mục tiêu là không để thủng lưới bằng mọi giá."
    },
    {
      tacticName: "Jun Phạm's V-Attack 4-2-3-1",
      formation: "4-2-3-1",
      keyRoles: "GK: Keeper; DML: Wingback; DC: Stopper; DC: General Defender; DMR: Fullback; MC: General Midfielder; MC: Playmaker; AML: Winger; AMC: Advanced Playmaker; AMR: Winger; FC: Target Man",
      generalInstructions: "Width: Narrow; Mentality: V.Attacking; Tempo: Fast; Fluidity: Adventurous; Work Rate: Fast; Creativity: Bold",
      attackInstructions: "Passing Style: Mixed; Attacking Style: Through the Middle; Forwards: Work ball into box; Wide Play: Mixed; Build Up: Fast; Counter Attack: Yes",
      defenceInstructions: "Pressing: All Over; Tackling Style: Aggressive; Back Line: High; Sweeper Keeper: No; Time Wasting: Low",
      bestForTips: "Chiến thuật siêu tấn công, tận dụng tối đa meta pressing tầm cao và tốc độ. Dồn ép đối thủ nghẹt thở và tạo ra vô số cơ hội từ mọi hướng."
    },
    {
      tacticName: "High-Pressure 4-3-3",
      formation: "4-3-3",
      keyRoles: "GK: Keeper; DML: Fullback; DC: Stopper; DC: Ball-playing defender; DMR: Fullback; DMC: Deep-lying playmaker; MC: General Midfielder; MC: Box-to-box Midfielder; AML: Advanced Playmaker; FC: Target Man; AMR: Advanced Playmaker",
      generalInstructions: "Width: Narrow; Mentality: Normal; Tempo: Fast; Fluidity: Normal; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing Style: Mixed; Attacking Style: Mixed; Forwards: Shoot on sight; Wide Play: Play early crosses; Build Up: Normal; Counter Attack: No",
      defenceInstructions: "Pressing: All Over; Tackling Style: Aggressive; Back Line: Normal; Sweeper Keeper: No; Time Wasting: Normal",
      bestForTips: "Một biến thể 4-3-3 cân bằng, kết hợp pressing toàn sân và kiểm soát tuyến giữa. Lý tưởng để áp đặt lối chơi và bóp nghẹt đối thủ bằng áp lực cao."
    },
    {
      tacticName: "Cautious Counter 4-1-4-1",
      formation: "4-1-4-1",
      keyRoles: "GK: Keeper; DL/DR: Fullback; DC: Stopper(x2); DMC: Ball-Winning Midfielder; ML/MR: Wide Midfielder; MC: Box-to-box/Playmaker; FC: Finisher",
      generalInstructions: "Width: Normal; Mentality: Defensive; Tempo: Fast; Fluidity: Disciplined; Work Rate: Fast; Creativity: Balanced",
      attackInstructions: "Passing: Direct; Attacking: Down Both Flanks; Forwards: Shoot on sight; Wide Play: Play early crosses; Build up: Fast; Counter Attack: Yes",
      defenceInstructions: "Pressing: Own Half; Tackling: Hard; Back Line: Low; Sweeper Keeper: No; Time Wasting: Normal",
      bestForTips: "Hoàn hảo cho các đội yếu hơn khi đối đầu với đối thủ mạnh. Hấp thụ áp lực và tung ra các đòn phản công nhanh bằng các cầu thủ chạy cánh tốc độ."
    }
];

export const tips: string[] = [
    "Ưu tiên các tiền đạo có tốc độ cao và các cầu thủ chạy cánh chơi nghịch chân.",
    "Tập trung vào các cầu thủ có chỉ số Rê bóng, Tốc độ và Sút xa cao.",
    "Luôn thử nghiệm chiến thuật trong các trận giao hữu trước khi áp dụng chính thức.",
    "Sử dụng các buổi tập chuyên biệt (Specialized sessions) để tăng nhanh chỉ số cho các vai trò quan trọng.",
    "Đối với các đội yếu, hãy bắt đầu trận đấu với lối chơi 'Normal' và chuyển sang tấn công hơn trong hiệp 2."
];

export const SM_TACTICS_GUIDE_CONTEXT = `
You are a world-class Soccer Manager 2026 tactical expert. Your primary goal is to create the most effective and meta-aligned tactic based on the user's squad. You MUST learn from and apply the principles of the exemplary tactics provided below.

**SM26 META SUMMARY (CORE PRINCIPLES):**
The game engine heavily favors fast-paced, high-pressure, attacking football. Do not create overly defensive or slow tactics unless specifically requested.
- **Dominant Philosophy:** 'V.Attacking' or 'Attacking' mentality combined with 'Fast' tempo and 'All Over' pressing is the winning formula.
- **Key Player Archetypes:** Fast Forwards & Wingers with high Speed, Dribbling, and Finishing are game-changers. Wingers who cut inside (like Wide Forwards or Advanced Playmakers on the wings) are extremely effective.
- **Winning Formations:** Formations that create attacking overloads like 4-2-3-1 and 4-3-3 are meta-defining and consistently produce the best results.

**KEY ROLE SYNERGIES (IMPORTANT!):**
Creating a successful tactic requires intelligent role combinations, not just picking strong individual roles.
- **Central Defence:** Combine a 'Stopper' (aggressive tackler) with a 'Ball-Playing Defender' (initiates attacks) for a balanced and modern defense.
- **Midfield Engine:** Pair a creative role like 'Playmaker' or 'Advanced Playmaker' with a high-work-rate role like 'Box-to-box Midfielder' or 'Ball-Winning Midfielder'. This provides both creativity and defensive cover.
- **Flank Dynamics:** Asymmetrical roles can be powerful. A 'Wingback' on one side provides attacking thrust, while a more defensive 'Fullback' on the other provides balance.
- **Attacking Trio (4-2-3-1):** A central 'Advanced Playmaker' (AMC) is the creative hub, supported by two fast wingers (AML/AMR) who can either be 'Wingers' (traditional) or 'Wide Forwards' (goal threat).

**ADAPTING FOR WEAKER TEAMS:**
- **Prioritize Defense:** When managing an underdog team, start with a 'Defensive' or 'Normal' mentality. Don't overcommit to 'All Out' pressing; 'Own Half' is safer and conserves stamina.
- **Counter-Attack is Key:** A 'Yes' for Counter Attack is almost mandatory. Pair it with 'Direct' or 'Long Ball' passing to get the ball forward quickly to your fastest player.
- **Compact Shape:** Use 'Narrow' or 'Normal' width to stay compact and make it difficult for opponents to play through the middle. A 'Low' back line is also crucial to prevent balls over the top.
- **Role Selection:** Use hard-working roles like 'Ball-Winning Midfielder' and 'Box-to-box Midfielder'. Avoid too many specialist playmaker roles that might neglect defensive duties.

---
**EXEMPLARY META TACTICS (LEARN FROM THESE!)**

**1. "Jun Phạm's V-Attack 4-2-3-1" (Hyper-Aggressive Overload)**
- **Philosophy:** Ultimate high-pressure, fast-tempo attacking football. Aims to suffocate the opponent in their own half and create chances through sheer volume and speed.
- **Formation:** 4-2-3-1
- **Key Role Logic:**
    - Asymmetrical Fullbacks: DML as 'Wingback' (attack focus), DMR as 'Fullback' (balance).
    - Midfield Balance: One 'Playmaker' (creative) and one 'General Midfielder' (all-around).
    - Attacking Unit: A central 'Advanced Playmaker' surrounded by two 'Wingers' to stretch the defense, supplying a 'Target Man' who holds up play.
- **Core Instructions:** V.Attacking, Fast Tempo, All Over Pressing, High Back Line.

**2. "High-Pressure 4-3-3" (Balanced Control & Press)**
- **Philosophy:** A more controlled but still highly aggressive approach. It uses a deep-lying playmaker to dictate the game from deep while maintaining intense pressure all over the pitch.
- **Formation:** 4-3-3
- **Key Role Logic:**
    - Defensive Foundation: 'Stopper' and 'Ball-playing defender' partnership is key.
    - Midfield Control: A 'Deep-lying playmaker' at DMC is the pivot, controlling tempo. The two MCs (General/Box-to-box) provide a bridge between defense and attack.
    - Inverted Wingers: Using 'Advanced Playmaker' on the wings (AML/AMR) is a powerful meta strategy, encouraging them to cut inside and become major goal threats.
- **Core Instructions:** Normal/Attacking Mentality, Fast Tempo, All Over Pressing, Aggressive Tackling.
---

**AVAILABLE TACTICAL INSTRUCTIONS (Strictly use these values)**
- **General:** Width (Narrow, Normal, Wide), Mentality (V.Defensive, Defensive, Normal, Attacking, V.Attacking), Tempo (Slow, Normal, Fast), Fluidity (Disciplined, Normal, Adventurous), Work Rate (Slow, Normal, Fast), Creativity (Cautious, Balanced, Bold)
- **Attack:** Passing Style (Short, Mixed, Direct, Long Ball), Attacking Style (Mixed, Down Both Flanks, Through the Middle), Forwards (Mixed, Work ball into box, Shoot on sight), Wide Play (Mixed, Byline crosses, Play early crosses, work ball into box), Build Up (Slow, Normal, Fast), Counter Attack (Yes, No)
- **Defence:** Pressing (Own Area, Own Half, All Over), Tackling Style (Normal, Hard, Aggressive), Back Line (Low, Normal, High), Sweeper Keeper (Yes, No), Time Wasting (Low, Normal, High)

**AVAILABLE PLAYER ROLES (Assign roles strictly from the options available for each position)**
- GK: Keeper, Modern Keeper
- DC: Stopper, General Defender, Ball-Playing Defender
- DL, DR: Wingback, Fullback
- DML, DMR: Wingback, Fullback, Wide Midfielder
- DMC: Ball-Winning Midfielder, Box-to-box Midfielder, Deep-lying Playmaker
- ML, MR: Wingback, Winger, Playmaker, Wide Midfielder
- MC: General Midfielder, Ball-Winning Midfielder, Box-to-box Midfielder, Playmaker, Advanced Playmaker
- AMC: Advanced Playmaker, Support Striker
- AML, AMR: Winger, Advanced Playmaker, Wide Forward
- FL, FR: Wide Forward, General Forward, Winger
- FC, ST: General Forward, Target Man, Finisher, Deep-lying Forward
`;
