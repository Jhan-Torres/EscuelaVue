const API = "https://api.github.com/users/";
const requestMaxTimeMs = 3000;

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
      return this.favorites.has(this.result.login)
    },
    allFavorites() {
      return Array.from(this.favorites.values())
      // Array.from --> convierte un elemento iterable en un Array
      // .values() --> dado que es un map, este metodo retorna los valores del map
    }
  },

  methods: {
    async doSearch() {
      this.result = this.errorFound = null;

      const foundInFavorites = this.favorites.get(this.search);

      const shouldRequestAgain = (() => {
        if (!!foundInFavorites) {
          const { lastRequestTime } = foundInFavorites
          const now = Date.now()
          return (now - lastRequestTime) > requestMaxTimeMs
        }
        return false
      })(); //IIFE

      //dobule bang operator (!!) is used to convert values to boolean
      if (!!foundInFavorites && !shouldRequestAgain) {
        console.log("Found and we use the cached version")
        return this.result = foundInFavorites
      }

      try {
        console.log("Not found or cached version is too old");
        const response = await fetch(API + this.search.trim());
        if(!response.ok) throw new Error(`user "${this.search}", not found.`)
        const data = await response.json();
        this.result = data;
        foundInFavorites .lastRequestTime = Date.now();
      } catch (error) {
        this.errorFound = error;
      } finally {
        this.search = null;
      }
    },

    addFavorite() {
      //to store data when favorite was added to updated new changes if they happen on github´s profile  
      this.result.lastRequestTime = Date.now();

      this.favorites.set(this.result.login, this.result);
      this.updateStorage();
    },
    
    removeFavorite() {
      this.favorites.delete(this.result.login);
      this.updateStorage();
    },

    updateStorage() {
      window.localStorage.setItem('favorites', JSON.stringify(this.allFavorites));
      //converted to string due browser´s local storage can storage strings only
    },

    showFavorite(favorite) {
      this.result = favorite;
    }
  },

  //lifecycle method to get favorites map from local storage
  created() {
    const savedFavorites = JSON.parse(window.localStorage.getItem("favorites"));
    if (savedFavorites?.length) {
      const favoritesStored = new Map(savedFavorites.map(favorite => [favorite.login, favorite])); 
      this.favorites = favoritesStored;
    }
  }
  
})

