/**
 * 教材目录注册表
 * 支持多套教材版本，按孩子账号绑定不同教材。
 */

const GRADE_LABELS = {
  "1A": "一年级上", "1B": "一年级下",
  "2A": "二年级上", "2B": "二年级下",
  "3A": "三年级上", "3B": "三年级下",
  "4A": "四年级上", "4B": "四年级下",
  "5A": "五年级上", "5B": "五年级下",
  "6A": "六年级上", "6B": "六年级下",
};

const TEXTBOOKS = [
  {
    id: "hujiao-oxford-2024",
    name: "沪教牛津版（2024）",
    shortName: "沪教牛津",
    subtitle: "义务教育教科书·英语（六三制一起）",
    dataKey: "oxford",
  },
  {
    id: "hujiao-kouyu-2025",
    name: "沪教版英语口语交际",
    shortName: "口语交际",
    subtitle: "经广东省中小学教材审定委员会2025年复审通过",
    dataKey: "kouyu",
  },
];

const Catalog = {
  gradeLabel(gradeId) {
    return GRADE_LABELS[gradeId] || gradeId;
  },

  listTextbooks() {
    return TEXTBOOKS;
  },

  getTextbook(id) {
    return TEXTBOOKS.find((t) => t.id === id) || TEXTBOOKS[0];
  },

  /** 获取指定教材的完整课程数据 */
  getCourseData(textbookId) {
    const tb = this.getTextbook(textbookId);
    if (tb.dataKey === "kouyu") {
      return typeof COURSE_DATA_KOUYU !== "undefined" ? COURSE_DATA_KOUYU : COURSE_DATA;
    }
    return COURSE_DATA;
  },

  /** 获取当前活跃孩子的课程数据 */
  getActiveCourseData() {
    const ctx = Storage.getContext();
    return this.getCourseData(ctx.textbookId);
  },

  gradesFor(textbookId) {
    return this.getCourseData(textbookId).map((g) => g.id);
  },

  findUnit(textbookId, unitId) {
    for (const g of this.getCourseData(textbookId)) {
      const u = g.units.find((x) => x.id === unitId);
      if (u) return u;
    }
    return null;
  },

  findUnitActive(unitId) {
    const ctx = Storage.getContext();
    return this.findUnit(ctx.textbookId, unitId);
  },
};

if (typeof window !== "undefined") {
  window.Catalog = Catalog;
  window.GRADE_LABELS = GRADE_LABELS;
}
