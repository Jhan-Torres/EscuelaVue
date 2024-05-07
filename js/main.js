const API = "https://api.github.com/users/";

const app = Vue.createApp({
  data() {
    return {
      search: null,
      result: null,
      errorFound: false,
      favorites: new Map(),
    }
  },
  computed: {
    isFavorite() {
      return this.favorites.has(this.result.id)
    }
  },
  methods: {
    async doSearch() {
      this.result = this.errorFound = null;
      try {
        const response = await fetch(API + this.search);
        if(!response.ok) throw new Error(`user ${this.search} not found`)
        const data = await response.json();
        this.result = data;
        console.log(data);

      } catch (error) {
        this.errorFound = error;
      } finally {
        this.search = null;
      }
    },

    addFavorite() {
      this.favorites.set(this.result.id, this.result);
    },
    
    removeFavorite() {
      this.favorites.delete(this.result.id);
    }
  }
})

