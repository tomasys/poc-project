Set IE = CreateObject("InternetExplorer.Application")
IE.Top = 0
IE.Left = 0
IE.StatusBar = True
IE.Visible = True
IE.Width = "1024"
IE.Height = "768"
IE.navigate "http://localhost:8080/ui/app/sce/A14/data/popup.html"